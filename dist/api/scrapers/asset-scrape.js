import path from 'path';
import { cleanseHtml, extractFormData, extractPageContent, hashUrl, preprocessImageUrl, updateImageObjWithLogo } from './utils.js';
import { analyzePageData } from '../openai/api.js';
import { setupBrowser } from './playwright-setup.js';
// This function needs tweaking, but conceptually this works...
async function scrollToLazyLoadImages(page, millisecondsBetweenScrolling, url) {
    try {
        const visibleHeight = await page.evaluate(() => {
            return Math.min(window.innerHeight, document.documentElement.clientHeight);
        });
        let scrollsRemaining = Math.ceil(await page.evaluate((inc) => document.body.scrollHeight / inc, visibleHeight));
        //console.debug(`visibleHeight = ${visibleHeight}, scrollsRemaining = ${scrollsRemaining}`)
        // scroll until we're at the bottom...
        while (scrollsRemaining > 0) {
            await page.evaluate((amount) => window.scrollBy(0, amount), visibleHeight);
            await page.waitForTimeout(millisecondsBetweenScrolling);
            scrollsRemaining--;
        }
    }
    catch (err) {
        console.error(`unable to lazy load page ${url}: `, err);
    }
}
// Main scrape function
export async function scrape(settings, n) {
    const { browser, page } = await setupBrowser();
    const isHomePage = n === 0;
    //scraping site images
    let imageFiles = [];
    //limit image scraping to the first 22 pages found
    if (settings.scrapeImages && n < 23) {
        console.log('Scraping images...');
        imageFiles = await scrapeImagesFromPage(page, browser);
    }
    else {
        console.log('Skipping image scrape.', settings.url);
    }
    try {
        const response = await page.goto(settings.url, {
            timeout: settings.timeoutLength || 60000,
            waitUntil: 'domcontentloaded',
        });
        if (isHomePage) {
            await page.waitForTimeout(4000);
        }
        // Check if we're still on a challenge page
        const pageTitle = await page.title();
        if (pageTitle.includes('Just a moment')) {
            console.log('Detected Cloudflare challenge page, waiting longer...', settings.url);
            await page.waitForTimeout(10000);
        }
        console.log('Page loaded, proceeding with scrape...');
        if (!response || !response.ok()) {
            if (response) {
                console.error(`Response status: ${response.status()}`);
                console.error(`Response headers:`, response.headers());
                console.error(`Response body:`, await response.text().catch(() => '[Unable to read body]'));
            }
            else {
                console.error(`Response object is null/undefined`);
            }
            throw new Error(`Failed to load the page: ${settings.url} (status: ${response?.status()})`);
        }
        //extract form data from pages
        const formData = await extractFormData(page);
        let screenshotBuffer;
        //home page or contact page
        if (isHomePage) {
            screenshotBuffer = await page.screenshot({ fullPage: true });
            imageFiles.push({
                imageFileName: 'home-screenshot.jpg',
                fileContents: screenshotBuffer,
                url: null, //setting this to undefined prevents Duda uploading
                hashedFileName: '',
                originalImageLink: '',
                fileExtension: '.jpg',
            });
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
        let scrapeAnalysisResult;
        if (isHomePage && settings.analyzeHomepageData && screenshotBuffer) {
            console.log('Using AI to analyze page...');
            const cleanedHtml = await cleanseHtml(page); //remove unwanted elements
            scrapeAnalysisResult = await analyzePageData(settings.url, screenshotBuffer, cleanedHtml);
            if (scrapeAnalysisResult.logoTag) {
                console.log('Found a logo src object', scrapeAnalysisResult.logoTag);
                imageFiles = updateImageObjWithLogo(scrapeAnalysisResult.logoTag, imageFiles);
            }
        }
        //this step must be done last as it modies the DOM
        const pageTextContent = await extractPageContent(page);
        //stop lazy load image processing after 10 pages for speed reasons
        if (settings.scrapeImages && n < 11) {
            await scrollToLazyLoadImages(page, 1000, settings.url);
        }
        await browser.close();
        return {
            imageList: imageFiles.map((file) => file.originalImageLink),
            imageFiles,
            pageSeo: { ...seoData, pageUrl: settings.url },
            businessInfo: scrapeAnalysisResult,
            content: pageTextContent,
            forms: formData,
        };
    }
    catch (error) {
        console.error(`Error scraping URL: ${settings.url}. Details: ${error.message}`);
        throw error;
    }
}
const scrapeImagesFromPage = async (page, browser) => {
    try {
        const imageFiles = [];
        const imagePromises = []; // Store all async image processing
        page.on('response', async (response) => {
            if (response.request().resourceType() === 'image') {
                const url = new URL(response.url());
                // Handle possible redirect
                const status = response.status();
                if (status >= 300 && status <= 399) {
                    //console.info(`Redirect from ${url} to ${response.headers()['location']}`)
                    return;
                }
                const contentType = response.headers()['content-type'];
                if (!contentType || !contentType.startsWith('image/')) {
                    //console.log(`Skipping non-image URL: ${url.href}`)
                    return;
                }
                // Skip if page or browser is already closed
                if (page.isClosed() || browser.isConnected() === false) {
                    console.warn(`Skipping response.body() because the page or browser is closed: ${url.href}`);
                    return;
                }
                // Process image response asynchronously and store the promise
                const imageProcessingPromise = (async () => {
                    try {
                        const fileContents = await response.body();
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
                        if (fileName.endsWith('=FGET')) {
                            //console.log(`Skipping URL with invalid extension =fget: ${url.href}`)
                            return;
                        }
                        // Ensure file extension is properly formatted
                        let fileNameWithExt = fileName.replaceAll(fileExtension, '') + fileExtension;
                        imageFiles.push({
                            imageFileName: fileNameWithExt,
                            fileContents: fileContents,
                            url: url,
                            hashedFileName: hashedFileName,
                            originalImageLink: processedImageUrl,
                            fileExtension: fileExtension,
                        });
                    }
                    catch (err) {
                        console.error(`Error processing image response from ${url.href}:`, err);
                    }
                })();
                imagePromises.push(imageProcessingPromise); // Store the promise
            }
        });
        // Wait for all image processing to complete before returning
        await page.waitForLoadState('networkidle');
        await Promise.all(imagePromises);
        return imageFiles;
    }
    catch (error) {
        console.error('Error scraping images:', error);
        throw error;
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzZXQtc2NyYXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vYXBpL3NjcmFwZXJzL2Fzc2V0LXNjcmFwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLElBQUksTUFBTSxNQUFNLENBQUE7QUFFdkIsT0FBTyxFQUFFLFdBQVcsRUFBRSxlQUFlLEVBQUUsa0JBQWtCLEVBQUUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLHNCQUFzQixFQUFFLE1BQU0sWUFBWSxDQUFBO0FBQ2xJLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQTtBQUdsRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sdUJBQXVCLENBQUE7QUFvQnBELCtEQUErRDtBQUMvRCxLQUFLLFVBQVUsc0JBQXNCLENBQUMsSUFBVSxFQUFFLDRCQUFvQyxFQUFFLEdBQVc7SUFDL0YsSUFBSSxDQUFDO1FBQ0QsTUFBTSxhQUFhLEdBQUcsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRTtZQUMzQyxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxRQUFRLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxDQUFBO1FBQzlFLENBQUMsQ0FBQyxDQUFBO1FBQ0YsSUFBSSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxZQUFZLEdBQUcsR0FBRyxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUE7UUFDL0csMkZBQTJGO1FBRTNGLHNDQUFzQztRQUN0QyxPQUFPLGdCQUFnQixHQUFHLENBQUMsRUFBRSxDQUFDO1lBQzFCLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFD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