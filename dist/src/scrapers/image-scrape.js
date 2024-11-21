import chromium from 'playwright-aws-lambda';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { convertUrlToApexId } from '../utilities/utils.js';
import { ScrapingError } from '../utilities/errors.js';
import { addImageToS3 } from '../utilities/s3Functions.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export async function scrapeImagesFromSite(settings) {
    try {
        const siteName = settings.url;
        const dirName = convertUrlToApexId(settings.url);
        const imageList = await scrape({
            url: siteName,
            storagePath: path.resolve(__dirname, 'scraped-images', dirName),
            method: settings.method,
        });
        return { scrapedImages: imageList, url: siteName };
    }
    catch (err) {
        console.error('Error during scrapeImagesFromSite:', err);
        throw new ScrapingError({
            domain: settings.url,
            message: `Failed to scrape images for site: ${settings.url}. Error: ${err.message || err}`,
            state: { scrapeStatus: 'URL not able to be scraped' },
            errorType: 'SCR-011',
        });
    }
}
/* async function scrape(settings: Settings) {
    if (settings.method === 'writeFolder') {
        fs.mkdirSync(settings.storagePath, { recursive: true })
    }

    const browser = await chromium.launch()
    const page = await browser.newPage()

    const imageList: string[] = []
    page.on('response', async (response: Response) => {
        const url = new URL(response.url())
        if (response.request().resourceType() === 'image') {
            const status = response.status()
            if (status >= 300 && status <= 399) {
                console.info(`Redirect from ${url} to ${response.headers()['location']}`)
                return
            }

            response.body().then(async (fileContents) => {
                const hashedFileName = hashUrl(response.url())
                const fileExtension = path.extname(url.pathname) || '.jpg' // Default to .jpg if no extension
                console.log('file exts', response.url().toString(), path.extname(url.pathname))
                const fileName = `${hashedFileName}${fileExtension}`
                const filePath = path.resolve(settings.storagePath, fileName)

                console.debug(`url = ${url}, filePath = ${filePath}`)
                const nonHashFileName = url.pathname.split('/').pop()?.toString() || ''
                imageList.push(nonHashFileName)

                //write files to folder system
                if (settings.method === 'writeFolder') {
                    const writeStream = fs.createWriteStream(filePath)
                    writeStream.write(fileContents)
                }

                //upload to s3 if that is the method used
                if (settings.method === 's3Upload') {
                    const basePath = convertUrlToApexId(settings.url) + '/scraped'
                    await addImageToS3(fileContents, `${basePath}/${fileName}`)
                }
            })
        }
    })

    try {
        console.log(`Attempting to load URL: ${settings.url}`)
        const response = await page.goto(settings.url, { timeout: 10000 })

        if (!response || !response.ok()) {
            throw new Error(`Failed to load the page: ${settings.url} (status: ${response?.status()})`)
        }
        console.log(`Page loaded successfully: ${settings.url}`)

        await scrollToLazyLoadImages(page, 1000)
        await browser.close()
        return imageList
    } catch (error) {
        console.error(`Error loading URL: ${settings.url}. Details: ${error.message}`)
        throw new Error(`Error loading URL: ${settings.url}. Details: ${error.message}`)
    }
} */
async function scrape(settings) {
    if (settings.method === 'writeFolder') {
        fs.mkdirSync(settings.storagePath, { recursive: true });
    }
    // Launch Chromium with the appropriate arguments
    const browser = await chromium
        .launchChromium({
        headless: false,
        args: chromium.getChromiumArgs(false), // Pass arguments for Chromium launch
    })
        .catch((error) => {
        console.error('Failed to launch Chromium:', error);
        throw error;
    });
    if (!browser) {
        throw new Error('Chromium browser instance could not be created.');
    }
    const page = await browser.newPage();
    const imageList = []; // This will hold the names of the scraped images
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
                const fileName = `${hashedFileName}${fileExtension}`;
                const filePath = path.resolve(settings.storagePath, fileName);
                console.debug(`url = ${url}, filePath = ${filePath}`);
                const nonHashFileName = url.pathname.split('/').pop()?.toString() || '';
                imageList.push(nonHashFileName); // Add the non-hashed file name to the list of images
                // Write the file to the local folder if specified
                if (settings.method === 'writeFolder') {
                    const writeStream = fs.createWriteStream(filePath);
                    writeStream.write(fileContents);
                }
                // Upload the image to S3 if specified
                if (settings.method === 's3Upload') {
                    const basePath = convertUrlToApexId(settings.url) + '/scraped';
                    await addImageToS3(fileContents, `${basePath}/${fileName}`);
                }
            });
        }
    });
    try {
        console.log(`Attempting to load URL: ${settings.url}`);
        const response = await page.goto(settings.url, { timeout: 10000 });
        if (!response || !response.ok()) {
            throw new Error(`Failed to load the page: ${settings.url} (status: ${response?.status()})`);
        }
        console.log(`Page loaded successfully: ${settings.url}`);
        // Scroll to load lazy-loaded images if necessary
        await scrollToLazyLoadImages(page, 1000);
        await browser.close();
        // Return the list of image names after all images are scraped
        return imageList;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2Utc2NyYXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3NjcmFwZXJzL2ltYWdlLXNjcmFwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLFFBQVEsTUFBTSx1QkFBdUIsQ0FBQTtBQUU1QyxPQUFPLEVBQUUsTUFBTSxJQUFJLENBQUE7QUFDbkIsT0FBTyxJQUFJLE1BQU0sTUFBTSxDQUFBO0FBQ3ZCLE9BQU8sTUFBTSxNQUFNLFFBQVEsQ0FBQTtBQUMzQixPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sS0FBSyxDQUFBO0FBQ25DLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHVCQUF1QixDQUFBO0FBQzFELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQTtBQUN0RCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sNkJBQTZCLENBQUE7QUFFMUQsTUFBTSxVQUFVLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDakQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQTtBQVExQyxNQUFNLENBQUMsS0FBSyxVQUFVLG9CQUFvQixDQUFDLFFBQWtCO0lBQ3pELElBQUk7UUFDQSxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFBO1FBQzdCLE1BQU0sT0FBTyxHQUFHLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNoRCxNQUFNLFNBQVMsR0FBRyxNQUFNLE1BQU0sQ0FBQztZQUMzQixHQUFHLEVBQUUsUUFBUTtZQUNiLFdBQVcsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxnQkFBZ0IsRUFBRSxPQUFPLENBQUM7WUFDL0QsTUFBTSxFQUFFLFFBQVEsQ0FBQyxNQUFNO1NBQzFCLENBQUMsQ0FBQTtRQUVGLE9BQU8sRUFBRSxhQUFhLEVBQUUsU0FB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