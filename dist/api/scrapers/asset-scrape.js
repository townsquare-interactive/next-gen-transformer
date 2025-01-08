import path from 'path';
import crypto from 'crypto';
import { chromium as playwrightChromium } from 'playwright';
import chromium from '@sparticuz/chromium';
import { preprocessImageUrl, updateImageObjWithLogo } from './utils.js';
import { capturePageAndAnalyze } from '../openai/api.js';
export async function scrape(settings, n) {
    // Launch Chromium with the appropriate arguments
    const browser = await playwrightChromium
        .launch({
        headless: false,
        executablePath: process.env.AWS_EXECUTION_ENV
            ? await chromium.executablePath() // Use Sparticuz Chromium executable in AWS or Vercel
            : undefined, // Use default Playwright binary locally
        args: [
            ...chromium.args, // Include Chromium's recommended args
            '--no-sandbox', // Disable sandbox for serverless compatibility
            '--disable-gpu', // Disable GPU rendering
            '--disable-setuid-sandbox',
        ],
    })
        .catch((error) => {
        console.error('Failed to launch Chromium:', error);
        throw error;
    });
    if (!browser) {
        throw new Error('Chromium browser instance could not be created.');
    }
    console.log('Chromium launched.');
    const page = await browser.newPage();
    console.log('New page created.');
    const imageList = []; // names of scraped images
    let imageFiles = []; //actual scraped image file contents
    console.log(`${settings.scrapeImages ? 'scraping images.....' : 'skipping image scrape'}`);
    if (settings.scrapeImages) {
        page.on('response', async (response) => {
            const url = new URL(response.url());
            if (response.request().resourceType() === 'image') {
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
                        console.warn(`Unexpected parsing of url ${url}, fileName is empty!`);
                        return;
                    }
                    //filter out requests for tracking
                    if (fileName?.endsWith('=FGET')) {
                        console.log(`Skipping URL with invalid extension =fget: ${url.href}`);
                        return;
                    }
                    //make sure file extension is at the end
                    let fileNameWithExt = fileName?.replaceAll(fileExtension, '') + fileExtension;
                    imageList.push(fileName);
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
    }
    try {
        console.log(`Attempting to load URL: ${settings.url} .....`);
        const response = await page.goto(settings.url, {
            timeout: settings.timeoutLength || 60000,
        });
        if (!response || !response.ok()) {
            throw new Error(`Failed to load the page: ${settings.url} (status: ${response?.status()})`);
        }
        console.log(`Page loaded successfully: ${settings.url}`);
        // Extract SEO-related data
        let seoData = await page.evaluate(() => {
            return {
                title: document.title || '',
                metaDescription: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
                metaKeywords: document.querySelector('meta[name="keywords"]')?.getAttribute('content') || '',
                ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '',
                ogDescription: document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '',
            };
        });
        //analyzing the homepage
        let scrapeAnalysisResult;
        if (n === 0 && settings.useAi) {
            //screenshot the homepage and analyze the content
            scrapeAnalysisResult = await capturePageAndAnalyze(page);
            if (scrapeAnalysisResult.logoTag) {
                console.log('found a logo src obj', scrapeAnalysisResult.logoTag);
                imageFiles = updateImageObjWithLogo(scrapeAnalysisResult.logoTag, imageFiles);
            }
        }
        // Scroll to load lazy-loaded images if necessary
        await scrollToLazyLoadImages(page, 1000);
        await browser.close();
        // Return the list of image names after all images are scraped
        return {
            imageList: imageList,
            imageFiles: imageFiles,
            pageSeo: { ...seoData, pageUrl: settings.url },
            screenshotAnalysis: scrapeAnalysisResult,
        };
    }
    catch (error) {
        console.error(`Error scraping URL: ${settings.url}. Details: ${error.message}`);
        throw error.message;
    }
}
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
function hashUrl(url) {
    return crypto.createHash('md5').update(url).digest('hex');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzZXQtc2NyYXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vYXBpL3NjcmFwZXJzL2Fzc2V0LXNjcmFwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLElBQUksTUFBTSxNQUFNLENBQUE7QUFDdkIsT0FBTyxNQUFNLE1BQU0sUUFBUSxDQUFBO0FBQzNCLE9BQU8sRUFBRSxRQUFRLElBQUksa0JBQWtCLEVBQUUsTUFBTSxZQUFZLENBQUE7QUFDM0QsT0FBTyxRQUFRLE1BQU0scUJBQXFCLENBQUE7QUFFMUMsT0FBTyxFQUFFLGtCQUFrQixFQUFFLHNCQUFzQixFQUFFLE1BQU0sWUFBWSxDQUFBO0FBQ3ZFLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLGtCQUFrQixDQUFBO0FBbUJ4RCxNQUFNLENBQUMsS0FBSyxVQUFVLE1BQU0sQ0FBQyxRQUFrQixFQUFFLENBQVM7SUFDdEQsaURBQWlEO0lBQ2pELE1BQU0sT0FBTyxHQUFHLE1BQU0sa0JBQWtCO1NBQ25DLE1BQU0sQ0FBQztRQUNKLFFBQVEsRUFBRSxLQUFLO1FBQ2YsY0FBYyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCO1lBQ3pDLENBQUMsQ0FBQyxNQUFNLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxxREFBcUQ7WUFDdkYsQ0FBQyxDQUFDLFNBQVMsRUFBRSx3Q0FBd0M7UUFDekQsSUFBSSxFQUFFO1lBQ0YsR0FBRyxRQUFRLENBQUMsSUFBSSxFQUFFLHNDQUFzQztZQUN4RCxjQUFjLEVBQUUsK0NBQStDO1lBQy9ELGVBQWUsRUFBRSx3QkFBd0I7WUFDekMsMEJBQTBCO1NBQzdCO0tBQ0osQ0FBQztTQUNELEtBQUssQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO1FBQ2IsT0FBTyxDQUFDLEtBQUssQ0FBQyw0QkFBNEIsRUFBRSxLQUFLLENBQUMsQ0FBQTtRQUNsRCxNQUFNLEtBQUssQ0FBQTtJQUNmLENBQUMsQ0FBQyxDQUFBO0lBRU4s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