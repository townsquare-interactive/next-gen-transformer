import path from 'path';
import crypto from 'crypto';
//import { ScrapingError } from '../../src/utilities/errors.js'
import { chromium as playwrightChromium } from 'playwright';
//sparticuz/chromium package needed to get playwright working correctly on vercel
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
                    // console.log('file ext', fileExtension)
                    //console.log('hash name', hashedFileName)
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
                    // console.debug(`url = ${url}, filePath = ${fileName}`)
                    imageList.push(fileName);
                    imageFiles.push({
                        imageFileName: fileNameWithExt,
                        fileContents: fileContents,
                        url: url,
                        hashedFileName: hashedFileName,
                        originalImageLink: processedImageUrl,
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
        throw new Error(`Error scraping URL: ${settings.url}. Details: ${error.message}`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzZXQtc2NyYXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vYXBpL3NjcmFwZXJzL2Fzc2V0LXNjcmFwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLElBQUksTUFBTSxNQUFNLENBQUE7QUFDdkIsT0FBTyxNQUFNLE1BQU0sUUFBUSxDQUFBO0FBQzNCLCtEQUErRDtBQUMvRCxPQUFPLEVBQUUsUUFBUSxJQUFJLGtCQUFrQixFQUFFLE1BQU0sWUFBWSxDQUFBO0FBQzNELGlGQUFpRjtBQUNqRixPQUFPLFFBQVEsTUFBTSxxQkFBcUIsQ0FBQTtBQUUxQyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxZQUFZLENBQUE7QUFDdkUsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sa0JBQWtCLENBQUE7QUFrQnhELE1BQU0sQ0FBQyxLQUFLLFVBQVUsTUFBTSxDQUFDLFFBQWtCLEVBQUUsQ0FBUztJQUN0RCxpREFBaUQ7SUFDakQsTUFBTSxPQUFPLEdBQUcsTUFBTSxrQkFBa0I7U0FDbkMsTUFBTSxDQUFDO1FBQ0osUUFBUSxFQUFFLEtBQUs7UUFDZixjQUFjLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUI7WUFDekMsQ0FBQyxDQUFDLE1BQU0sUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDLHFEQUFxRDtZQUN2RixDQUFDLENBQUMsU0FBUyxFQUFFLHdDQUF3QztRQUN6RCxJQUFJLEVBQUU7WUFDRixHQUFHLFFBQVEsQ0FBQyxJQUFJLEVBQUUsc0NBQXNDO1lBQ3hELGNBQWMsRUFBRSwrQ0FBK0M7WUFDL0QsZUFBZSxFQUFFLHdCQUF3QjtZQUN6QywwQkFBMEI7U0FDN0I7S0FDSixDQUFDO1NBQ0QsS0FBSyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7UUFDYixPQUFPLENBQUMsS0FBSyxDQUFDLDRCQUE0QixFQUFFLEtBQUssQ0FBQyxDQUFBO1FBQ2xELE1BQU0sS0FBSyxDQUFB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