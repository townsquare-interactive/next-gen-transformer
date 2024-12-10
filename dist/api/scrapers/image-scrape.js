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
export const scrapeAllPages = async (pages, settings, scrapeFunction) => {
    //now time to scrape
    const imageFiles = [];
    for (let n = 0; n < pages.length; n++) {
        try {
            console.log('scrape func 1');
            const imageData = await scrapeFunction({ ...settings, url: pages[n] });
            for (let i = 0; i < imageData.imageFiles.length; i++) {
                imageFiles.push(imageData.imageFiles[i]);
            }
        }
        catch (err) {
            console.log('scrape func fail 1');
            throw err;
        }
    }
    console.log('here is im files', imageFiles);
    return { imageFiles: imageFiles };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2Utc2NyYXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vYXBpL3NjcmFwZXJzL2ltYWdlLXNjcmFwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLElBQUksTUFBTSxNQUFNLENBQUE7QUFDdkIsT0FBTyxNQUFNLE1BQU0sUUFBUSxDQUFBO0FBQzNCLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQTtBQUM3RCxPQUFPLEVBQUUsUUFBUSxJQUFJLGtCQUFrQixFQUFFLE1BQU0sWUFBWSxDQUFBO0FBQzNELGlGQUFpRjtBQUNqRixPQUFPLFFBQVEsTUFBTSxxQkFBcUIsQ0FBQTtBQUUxQyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sS0FBSyxDQUFBO0FBQ25DLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQTtBQXNCakQsTUFBTSxDQUFDLEtBQUssVUFBVSxvQkFBb0IsQ0FBQyxRQUFrQjtJQUN6RCxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFBO0lBQzdCLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQTtJQUNmLElBQUksT0FBTyxHQUFHLFFBQVEsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFBO0lBQ25DLElBQUksU0FBUyxDQUFBO0lBQ2IsTUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDLFNBQVMsRUFBRSxjQUFjLElBQUksTUFBTSxDQUFBO0lBQ25FLE1BQU0sbUJBQW1CLEdBQUcsUUFBUSxDQUFDLFNBQVMsRUFBRSxtQkFBbUIsSUFBSSxTQUFTLENBQUE7SUFDaEYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsT0FBTyxDQUFDLENBQUE7SUFFbkMsT0FBTyxPQUFPLEdBQUcsT0FBTyxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDO1lBQ0QsTUFBTSxLQUFLLEdBQUcsTUFBTSxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsQ0FBQTtZQUNqRCxTQUFTLEdBQUcs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