import crypto from 'crypto';
import { chromium as playwrightChromium } from 'playwright';
//sparticuz/chromium package needed to get playwright working correctly on vercel
import chromium from '@sparticuz/chromium';
export async function scrape(settings) {
    console.log('scrape settings', settings);
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
                //const hashedName = hashUrl(response.url()) // Hash the image URL to create a unique name
                //const fileExtension = path.extname(url.pathname) || '.jpg' // Default to .jpg if no extension
                //const fileName = `${hashedName}${fileExtension}`
                //file logging stuff
                // const __filename = fileURLToPath(import.meta.url)
                //const __dirname = path.dirname(__filename)
                const fileName = url.pathname.split('/').pop();
                if (!fileName) {
                    console.warn(`Unexpected parsing of url ${url}, fileName is empty!`);
                    return;
                }
                console.debug(`url = ${url}, filePath = ${fileName}`);
                //const nonHashFileName = url.pathname.split('/').pop()?.toString() || ''
                imageList.push(fileName); // Add the non-hashed file name to the list of images
                imageFiles.push({ imageFileName: fileName, fileContents: fileContents, url: url });
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
        //seo stuff
        // Extract SEO-related data
        let seoData = await page.evaluate(() => {
            return {
                // pageUrl: '',
                title: document.title || '',
                metaDescription: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
                metaKeywords: document.querySelector('meta[name="keywords"]')?.getAttribute('content') || '',
                ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '',
                ogDescription: document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '',
            };
        });
        //seoData = { ...seoData, pageUrl: settings.url } //have to add pageUrl after since it is not part of the document
        console.log('SEO data extracted:', seoData);
        // Scroll to load lazy-loaded images if necessary
        await scrollToLazyLoadImages(page, 1000);
        await browser.close();
        // Return the list of image names after all images are scraped
        return { imageList: imageList, imageFiles: imageFiles, pageSeo: { ...seoData, pageUrl: settings.url } };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2Utc2NyYXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vYXBpL3NjcmFwZXJzL2ltYWdlLXNjcmFwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLE1BQU0sTUFBTSxRQUFRLENBQUE7QUFFM0IsT0FBTyxFQUFFLFFBQVEsSUFBSSxrQkFBa0IsRUFBRSxNQUFNLFlBQVksQ0FBQTtBQUMzRCxpRkFBaUY7QUFDakYsT0FBTyxRQUFRLE1BQU0scUJBQXFCLENBQUE7QUFpQjFDLE1BQU0sQ0FBQyxLQUFLLFVBQVUsTUFBTSxDQUFDLFFBQWtCO0lBQzNDLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLEVBQUUsUUFBUSxDQUFDLENBQUE7SUFDeEMsaURBQWlEO0lBQ2pELE1BQU0sT0FBTyxHQUFHLE1BQU0sa0JBQWtCO1NBQ25DLE1BQU0sQ0FBQztRQUNKLFFBQVEsRUFBRSxLQUFLO1FBQ2YsY0FBYyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCO1lBQ3pDLENBQUMsQ0FBQyxNQUFNLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxxREFBcUQ7WUFDdkYsQ0FBQyxDQUFDLFNBQVMsRUFBRSx3Q0FBd0M7UUFDekQsSUFBSSxFQUFFO1lBQ0YsR0FBRyxRQUFRLENBQUMsSUFBSSxFQUFFLHNDQUFzQztZQUN4RCxjQUFjLEVBQUUsK0NBQStDO1lBQy9ELGVBQWUsRUFBRSx3QkFBd0I7WUFDekMsMEJBQTBCO1NBQzdCO0tBQ0osQ0FBQztTQUNELEtBQUssQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO1FBQ2IsT0FBTyxDQUFDLEtBQUssQ0FBQyw0QkFBNEIsRUFBRSxLQUFLLENBQUMsQ0FBQTtRQUNsRCxNQUFNLEtBQUssQ0FBQTtJQUNmLENBQUMsQ0FBQyxDQUFBO0lBQ04sT0FBTyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsRUFBRSxrQkFBa0IsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFBO0lBRTdFLElBQUks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