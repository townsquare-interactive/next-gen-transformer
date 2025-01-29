import path from 'path';
import { chromium as playwrightChromium } from 'playwright';
import chromium from '@sparticuz/chromium';
import { hashUrl, preprocessImageUrl, updateImageObjWithLogo } from './utils.js';
import { capturePageAndAnalyze } from '../openai/api.js';
// Main scrape function
export async function scrape(settings, n) {
    const browser = await playwrightChromium
        .launch({
        headless: false,
        executablePath: process.env.AWS_EXECUTION_ENV ? await chromium.executablePath() : undefined,
        args: [...chromium.args, '--no-sandbox', '--disable-gpu', '--disable-setuid-sandbox'],
    })
        .catch((error) => {
        console.error('Failed to launch Chromium:', error);
        throw error;
    });
    if (!browser) {
        throw new Error('Chromium browser instance could not be created.');
    }
    const page = await browser.newPage();
    let imageFiles = [];
    //scraping site images
    if (settings.scrapeImages) {
        console.log('Scraping images...');
        imageFiles = await scrapeImagesFromPage(page);
    }
    else {
        console.log('Skipping image scrape.');
    }
    try {
        const response = await page.goto(settings.url, {
            timeout: settings.timeoutLength || 60000,
        });
        if (!response || !response.ok()) {
            throw new Error(`Failed to load the page: ${settings.url} (status: ${response?.status()})`);
        }
        const seoData = await page.evaluate(() => {
            return {
                title: document.title || '',
                metaDescription: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
                metaKeywords: document.querySelector('meta[name="keywords"]')?.getAttribute('content') || '',
                ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '',
                ogDescription: document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '',
            };
        });
        const pageTextContent = await extractPageContent(page);
        const formData = await extractFormData(page);
        if (n === 0 || settings.url.includes('contact')) {
            console.log('forms', formData[0]?.fields);
        }
        let scrapeAnalysisResult;
        if (n === 0 && settings.useAi) {
            console.log('Using AI to analyze page...');
            scrapeAnalysisResult = await capturePageAndAnalyze(page, settings.url);
            if (scrapeAnalysisResult.logoTag) {
                console.log('Found a logo src object', scrapeAnalysisResult.logoTag);
                imageFiles = updateImageObjWithLogo(scrapeAnalysisResult.logoTag, imageFiles);
            }
        }
        await scrollToLazyLoadImages(page, 1000);
        await browser.close();
        return {
            imageList: imageFiles.map((file) => file.originalImageLink),
            imageFiles,
            pageSeo: { ...seoData, pageUrl: settings.url },
            aiAnalysis: scrapeAnalysisResult,
            content: pageTextContent,
        };
    }
    catch (error) {
        console.error(`Error scraping URL: ${settings.url}. Details: ${error.message}`);
        throw error;
    }
}
// Separate function to handle image scraping
const scrapeImagesFromPage = async (page) => {
    const imageFiles = [];
    page.on('response', async (response) => {
        const url = new URL(response.url());
        if (response.request().resourceType() === 'image') {
            //handle possible redirect
            const status = response.status();
            if (status >= 300 && status <= 399) {
                console.info(`Redirect from ${url} to ${response.headers()['location']}`);
                return;
            }
            const contentType = response.headers()['content-type'];
            if (!contentType || !contentType.startsWith('image/')) {
                console.log(`Skipping non-image URL: ${url.href}`);
                return;
            }
            // Get the image content
            response.body().then(async (fileContents) => {
                const hashedName = hashUrl(response.url()); // Hash the image URL to create a unique name
                const fileExtension = path.extname(url.pathname) || '.jpg'; // Default to .jpg if no extension
                const hashedFileName = `${hashedName}${fileExtension}`;
                const processedImageUrl = preprocessImageUrl(url) || '';
                const fileName = processedImageUrl.split('/').pop();
                if (!fileName) {
                    console.warn(`Unexpected parsing of URL ${url}, fileName is empty!`);
                    return;
                }
                // Filter out requests for tracking
                if (fileName?.endsWith('=FGET')) {
                    console.log(`Skipping URL with invalid extension =fget: ${url.href}`);
                    return;
                }
                // Make sure file extension is at the end
                let fileNameWithExt = fileName?.replaceAll(fileExtension, '') + fileExtension;
                imageFiles.push({
                    imageFileName: fileNameWithExt,
                    fileContents: fileContents,
                    url: url,
                    hashedFileName: hashedFileName,
                    originalImageLink: processedImageUrl,
                    fileExtension: fileExtension,
                });
            });
        }
    });
    return imageFiles;
};
// This function needs tweaking, but conceptually this works...
async function scrollToLazyLoadImages(page, millisecondsBetweenScrolling) {
    const visibleHeight = await page.evaluate(() => {
        return Math.min(window.innerHeight, document.documentElement.clientHeight);
    });
    let scrollsRemaining = Math.ceil(await page.evaluate((inc) => document.body.scrollHeight / inc, visibleHeight));
    console.debug(`visibleHeight = ${visibleHeight}, scrollsRemaining = ${scrollsRemaining}`);
    // scroll until we're at the bottom...
    while (scrollsRemaining > 0) {
        await page.evaluate((amount) => window.scrollBy(0, amount), visibleHeight);
        await page.waitForTimeout(millisecondsBetweenScrolling);
        scrollsRemaining--;
    }
}
const extractPageContent = async (page) => {
    const pageTextContent = await page.evaluate(() => {
        // Unwanted tags for content scrape
        const unwantedSelectors = ['nav', 'footer', 'script', 'style'];
        unwantedSelectors.forEach((selector) => {
            document.querySelectorAll(selector).forEach((el) => el.remove());
        });
        // Remove <header> content without removing headline tags
        document.querySelectorAll('header *:not(h1):not(h2):not(h3):not(h4):not(h5):not(h6)').forEach((el) => {
            el.remove();
        });
        // Return visible text content
        return document.body.innerText.trim();
    });
    return pageTextContent;
};
const extractFormData = async (page) => {
    return await page.evaluate(() => {
        // Define the structure for form data
        const forms = Array.from(document.querySelectorAll('form')).map((form) => {
            // Extract the form title (legend, h1, h2, etc.)
            const titleElement = form.querySelector('legend, h1, h2, h3, h4, h5, h6');
            const title = titleElement?.textContent?.trim() || null;
            // Extract form fields
            const fields = Array.from(form.querySelectorAll('input, select, textarea')).map((field) => {
                const name = field.getAttribute('name') || '';
                const type = field.getAttribute('type') || (field.tagName === 'TEXTAREA' ? 'textarea' : 'text');
                const label = field.closest('label')?.textContent?.trim() || document.querySelector(`label[for="${field.id}"]`)?.textContent?.trim() || null;
                const placeholder = field.getAttribute('placeholder') || null;
                const required = field.hasAttribute('required');
                return { name, type, label, placeholder, required };
            });
            return { title, fields };
        });
        return forms;
    });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzZXQtc2NyYXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vYXBpL3NjcmFwZXJzL2Fzc2V0LXNjcmFwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLElBQUksTUFBTSxNQUFNLENBQUE7QUFDdkIsT0FBTyxFQUFFLFFBQVEsSUFBSSxrQkFBa0IsRUFBRSxNQUFNLFlBQVksQ0FBQTtBQUMzRCxPQUFPLFFBQVEsTUFBTSxxQkFBcUIsQ0FBQTtBQUUxQyxPQUFPLEVBQUUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLHNCQUFzQixFQUFFLE1BQU0sWUFBWSxDQUFBO0FBQ2hGLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLGtCQUFrQixDQUFBO0FBcUJ4RCx1QkFBdUI7QUFDdkIsTUFBTSxDQUFDLEtBQUssVUFBVSxNQUFNLENBQUMsUUFBa0IsRUFBRSxDQUFTO0lBQ3RELE1BQU0sT0FBTyxHQUFHLE1BQU0sa0JBQWtCO1NBQ25DLE1BQU0sQ0FBQztRQUNKLFFBQVEsRUFBRSxLQUFLO1FBQ2YsY0FBYyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLE1BQU0sUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTO1FBQzNGLElBQUksRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUUsZUFBZSxFQUFFLDBCQUEwQixDQUFDO0tBQ3hGLENBQUM7U0FDRCxLQUFLLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtRQUNiLE9BQU8sQ0FBQyxLQUFLLENBQUMsNEJBQTRCLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFDbEQsTUFBTSxLQUFLLENBQUE7SUFDZixDQUFDLENBQUMsQ0FBQTtJQUVOLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNYLE1BQU0sSUFBSSxLQUFLLENBQUMsaURBQWlELENBQUMsQ0FBQTtJQUN0RSxDQUFDO0lBRUQsTUFB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