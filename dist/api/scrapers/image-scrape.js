import path from 'path';
import crypto from 'crypto';
import { ScrapingError } from '../../src/utilities/errors.js';
import { chromium as playwrightChromium } from 'playwright';
//sparticuz/chromium package needed to get playwright working correctly on vercel
import chromium from '@sparticuz/chromium';
import { fileURLToPath } from 'url';
import { findPages } from './page-list-scrape.js';
export async function scrapeImagesFromSite(settings) {
    const siteName = settings.url;
    let attempt = 0;
    let retries = settings.retries || 3;
    let imageData;
    const scrapeFunction = settings.functions?.scrapeFunction || scrape;
    const scrapePagesFunction = settings.functions?.scrapePagesFunction || findPages;
    console.log('retry count', retries);
    while (attempt < retries) {
        try {
            const pages = await scrapePagesFunction(settings);
            //imageData = await scrapeFunction(settings)
            imageData = await scrapeAllPages(pages, settings, scrapeFunction);
            console.log('what is all images', imageData);
            return { imageNames: [], url: siteName, imageFiles: imageData.imageFiles };
            break;
        }
        catch (error) {
            console.error(`Attempt ${attempt + 1} failed. Retrying...`);
            attempt++;
            if (attempt === retries) {
                console.error(`Failed to scrape after ${retries} attempts.`);
                throw new ScrapingError({
                    domain: settings.url,
                    message: error.message,
                    state: { scrapeStatus: 'URL not able to be scraped' },
                    errorType: 'SCR-011',
                });
            }
        }
    }
    throw new ScrapingError({
        domain: settings.url,
        message: 'Unable to scrape site after multiple attempts',
        state: { scrapeStatus: 'URL not able to be scraped' },
        errorType: 'SCR-011',
    });
    //return { imageNames: [], url: siteName, imageFiles: imageData.imageFiles }
}
export async function scrape(settings) {
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
    console.log('Chromium executable path:', playwrightChromium.executablePath());
    if (!browser) {
        throw new Error('Chromium browser instance could not be created.');
    }
    console.log('Chromium launched.');
    const page = await browser.newPage();
    console.log('New page created.');
    const imageList = []; // names of scraped images
    const imageFiles = []; //actual scraped image file contents
    page.on('response', async (response) => {
        const url = new URL(response.url());
        if (response.request().resourceType() === 'image') {
            const status = response.status();
            if (status >= 300 && status <= 399) {
                console.info(`Redirect from ${url} to ${response.headers()['location']}`);
                return;
            }
            // Get the image content
            response.body().then(async (fileContents) => {
                const hashedFileName = hashUrl(response.url()); // Hash the image URL to create a unique name
                const fileExtension = path.extname(url.pathname) || '.jpg'; // Default to .jpg if no extension
                //const fileName = `${hashedFileName}${fileExtension}`
                //file logging stuff
                const __filename = fileURLToPath(import.meta.url);
                //const __dirname = path.dirname(__filename)
                const fileName = url.pathname.split('/').pop();
                if (!fileName) {
                    console.warn(`Unexpected parsing of url ${url}, fileName is empty!`);
                    return;
                }
                console.debug(`url = ${url}, filePath = ${fileName}`);
                const nonHashFileName = url.pathname.split('/').pop()?.toString() || '';
                imageList.push(nonHashFileName); // Add the non-hashed file name to the list of images
                imageFiles.push({ hashedFileName: fileName, fileContents: fileContents, url: url });
            });
        }
    });
    try {
        console.log(`Attempting to load URL: ${settings.url}`);
        const response = await page.goto(settings.url, {
            timeout: settings.timeoutLength || 60000,
        });
        if (!response || !response.ok()) {
            throw new Error(`Failed to load the page: ${settings.url} (status: ${response?.status()})`);
        }
        console.log(`Page loaded successfully: ${settings.url}`);
        // Scroll to load lazy-loaded images if necessary
        await scrollToLazyLoadImages(page, 1000);
        await browser.close();
        // Return the list of image names after all images are scraped
        return { imageList: imageList, imageFiles: imageFiles };
    }
    catch (error) {
        console.error(`Error loading URL: ${settings.url}. Details: ${error.message}`);
        throw new Error(`Error loading URL: ${settings.url}. Details: ${error.message}`);
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
const scrapeAllPages = async (pages, settings, scrapeFunction) => {
    //now time to scrape
    const imageFiles = [];
    for (let n = 0; n < pages.length; n++) {
        const imageData = await scrapeFunction({ ...settings, url: pages[n] });
        for (let i = 0; i < imageData.imageFiles.length; i++) {
            imageFiles.push(imageData.imageFiles[i]);
        }
    }
    console.log('here is im files', imageFiles);
    return { imageFiles: imageFiles };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2Utc2NyYXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vYXBpL3NjcmFwZXJzL2ltYWdlLXNjcmFwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLElBQUksTUFBTSxNQUFNLENBQUE7QUFDdkIsT0FBTyxNQUFNLE1BQU0sUUFBUSxDQUFBO0FBQzNCLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQTtBQUM3RCxPQUFPLEVBQUUsUUFBUSxJQUFJLGtCQUFrQixFQUFFLE1BQU0sWUFBWSxDQUFBO0FBQzNELGlGQUFpRjtBQUNqRixPQUFPLFFBQVEsTUFBTSxxQkFBcUIsQ0FBQTtBQUUxQyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sS0FBSyxDQUFBO0FBQ25DLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQTtBQXNCakQsTUFBTSxDQUFDLEtBQUssVUFBVSxvQkFBb0IsQ0FBQyxRQUFrQjtJQUN6RCxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFBO0lBQzdCLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQTtJQUNmLElBQUksT0FBTyxHQUFHLFFBQVEsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFBO0lBQ25DLElBQUksU0FBUyxDQUFBO0lBQ2IsTUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDLFNBQVMsRUFBRSxjQUFjLElBQUksTUFBTSxDQUFBO0lBQ25FLE1BQU0sbUJBQW1CLEdBQUcsUUFBUSxDQUFDLFNBQVMsRUFBRSxtQkFBbUIsSUFBSSxTQUFTLENBQUE7SUFDaEYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsT0FBTyxDQUFDLENBQUE7SUFFbkMsT0FBTyxPQUFPLEdBQUcsT0FBTyxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDO1lBQ0QsTUFBTSxLQUFLLEdBQUcsTUFBTSxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsQ0FBQTtZQUNqRCw0Q0FBNEM7WUFD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