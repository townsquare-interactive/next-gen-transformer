import { scrape } from '../../api/scrapers/asset-scrape.js';
import { findPages } from '../../api/scrapers/page-list-scrape.js';
import { ScrapingError } from '../utilities/errors.js';
import { convertUrlToApexId } from '../utilities/utils.js';
import { checkPagesAreOnSameDomain, removeDupeImages, renameDuplicateFiles } from '../../api/scrapers/utils.js';
import { deleteFolderS3 } from '../utilities/s3Functions.js';
import pLimit from 'p-limit';
export function getScrapeSettings(validatedRequest) {
    const scrapeSettings = {
        url: validatedRequest.url,
        saveMethod: validatedRequest.saveMethod || 's3Upload',
        uploadLocation: validatedRequest.uploadLocation,
        basePath: convertUrlToApexId(validatedRequest.url),
        backupImagesSave: validatedRequest.backupImagesSave === undefined ? true : validatedRequest.backupImagesSave,
        saveImages: validatedRequest.saveImages === undefined ? true : validatedRequest.saveImages,
        analyzeHomepageData: validatedRequest.analyzeHomepageData === undefined ? true : validatedRequest.analyzeHomepageData,
        scrapeImages: validatedRequest.scrapeImages === undefined ? true : validatedRequest.scrapeImages,
    };
    return scrapeSettings;
}
export async function scrapeAssetsFromSite(settings, pages) {
    const siteName = settings.url;
    const scrapeFunction = settings.functions?.scrapeFunction || scrape;
    const scrapePagesFunction = settings.functions?.scrapePagesFunction || findPages;
    const isValidateUrl = settings.functions?.isValidateUrl || isValidHtmlPage;
    try {
        //confirm base URL returns HTML
        if (!(await isValidateUrl(settings.url))) {
            throw { message: `Invalid or non-HTML page: ${settings.url}`, errorType: 'SCR-011' };
        }
        const pagesToScrape = pages ? pages : await scrapePagesFunction(settings);
        checkPagesAreOnSameDomain(settings.url, pagesToScrape);
        const scrapeData = await scrapeDataFromPages(pagesToScrape, settings, scrapeFunction);
        const transformedScrapedData = transformSiteScrapedData(scrapeData, siteName);
        if (!settings.analyzeHomepageData) {
            console.log('analyzeHomepageData is false so siteData file will not be overwritten');
        }
        //create s3 scrape data
        const siteData = {
            baseUrl: settings.url,
            pages: transformedScrapedData.pagesData,
            dudaUploadLocation: settings.uploadLocation || '',
            businessInfo: transformedScrapedData.businessInfo,
        };
        return { imageNames: [], url: siteName, imageFiles: transformedScrapedData.imageFiles, siteData: siteData };
    }
    catch (error) {
        console.error(error);
        throw new ScrapingError({
            domain: settings.url,
            message: error.message,
            state: { scrapeStatus: 'Site not scraped' },
            errorType: error.errorType || 'SCR-011',
        });
    }
}
export async function getPageList(settings) {
    const scrapePagesFunction = settings.functions?.scrapePagesFunction || findPages;
    const isValidateUrl = settings.functions?.isValidateUrl || isValidHtmlPage;
    try {
        if (!(await isValidateUrl(settings.url))) {
            throw { message: `Invalid or non-HTML page: ${settings.url}`, errorType: 'SCR-011' };
        }
        const pages = await scrapePagesFunction(settings);
        return { pages };
    }
    catch (error) {
        console.error(error);
        throw new ScrapingError({
            domain: settings.url,
            message: error.message,
            state: { scrapeStatus: 'Site not scraped' },
            errorType: 'SCR-011',
        });
    }
}
const transformSiteScrapedData = (scrapeData, url) => {
    //remove links from same domain
    if (scrapeData.businessInfo?.links.other) {
        const extLinks = scrapeData.businessInfo.links.other.filter((link) => !link.includes(url));
        scrapeData.businessInfo.links.other = extLinks;
    }
    return scrapeData;
};
export const scrapeDataFromPages = async (pages, settings, scrapeFunction) => {
    console.log('Starting scraping process...');
    if (pages.length === 0) {
        throw new Error('No pages to scrape.');
    }
    const homepage = pages[0]; // First page is always the homepage
    const otherPages = pages.slice(1); // Remaining pages
    const limit = pLimit(3); // Limit concurrency
    try {
        // **Step 1: Scrape the homepage first**
        console.log('Scraping homepage:', homepage, 'individually...');
        const homepageData = await scrapeFunction({ ...settings, url: homepage }, 0);
        if (!homepageData) {
            throw new Error(`Failed to scrape homepage: ${homepage}`);
        }
        // Extract AI analysis from homepage (if available)
        const screenshotPageData = homepageData.businessInfo;
        // Initialize storage for results
        const seo = [homepageData.pageSeo]; // Start with homepage SEO data
        const imageFiles = [...homepageData.imageFiles]; // Start with homepage images
        const pagesData = [
            {
                url: homepage,
                seo: homepageData.pageSeo,
                images: homepageData.imageList,
                content: homepageData.content,
                forms: homepageData.forms,
            },
        ];
        // **Step 2: Scrape other pages in parallel with limit**
        console.log('Starting limited parallel scraping for other pages...');
        const scrapedPages = await Promise.allSettled(otherPages.map((page, index) => limit(async () => {
            try {
                console.log('Scraping page:', page, '...');
                return await scrapeFunction({ ...settings, url: page }, index + 1);
            }
            catch (err) {
                console.error('Scrape function failed for page:', page, err);
                return null; // Handle failures gracefully
                // throw err
            }
        })));
        // Extract successful results
        const validScrapedPages = scrapedPages.filter((res) => res.status === 'fulfilled' && res.value).map((res) => res.value);
        // Push results from other pages
        seo.push(...validScrapedPages.map((data) => data.pageSeo));
        imageFiles.push(...validScrapedPages.flatMap((data) => data.imageFiles));
        pagesData.push(...validScrapedPages.map((data, index) => ({
            url: otherPages[index],
            seo: data.pageSeo,
            images: data.imageList,
            content: data.content,
            forms: data.forms,
        })));
        // Remove duplicate images
        const imageFilesNoDuplicates = await removeDupeImages(imageFiles);
        const renamedDupes = renameDuplicateFiles(imageFilesNoDuplicates);
        return { imageFiles: renamedDupes, seo, businessInfo: screenshotPageData, pagesData };
    }
    catch (err) {
        console.error('Error during scraping:', err);
        throw err;
    }
};
export const removeScrapedFolder = async (url) => {
    try {
        const siteFolderName = convertUrlToApexId(url);
        const scrapedFolder = `${siteFolderName}/scraped`;
        const deleteStatus = await deleteFolderS3(scrapedFolder);
        console.log(deleteStatus);
        return { ...deleteStatus, url: url };
    }
    catch (err) {
        throw new ScrapingError({
            domain: url,
            message: err.message,
            state: { fileStatus: 'site data not deleted from S3' },
            errorType: 'SCR-014',
        });
    }
};
async function isValidHtmlPage(url) {
    console.log('confirming URL is valid:', url);
    try {
        const response = await fetch(url, {
            method: 'HEAD',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
        });
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers));
        // Consider both 200 OK and 403 Cloudflare responses as valid if they return HTML
        const contentType = response.headers.get('content-type');
        console.log('Content-Type:', contentType);
        if (contentType?.includes('text/html')) {
            return true;
        }
        // If not HTML or no content type, then it's not valid
        return false;
    }
    catch (error) {
        console.error(`Failed to fetch ${url}:`, error);
        return false;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NyYXBlLWNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29udHJvbGxlcnMvc2NyYXBlLWNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFjLE1BQU0sRUFBRSxNQUFNLG9DQUFvQyxDQUFBO0FBQ3ZFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQTtBQUVsRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sd0JBQXdCLENBQUE7QUFDdEQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sdUJBQXVCLENBQUE7QUFDMUQsT0FBTyxFQUFFLHlCQUF5QixFQUFFLGdCQUFnQixFQUFFLG9CQUFvQixFQUFFLE1BQU0sNkJBQTZCLENBQUE7QUFDL0csT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDZCQUE2QixDQUFBO0FBRTVELE9BQU8sTUFBTSxNQUFNLFNBQVMsQ0FBQTtBQStDNUIsTUFBTSxVQUFVLGlCQUFpQixDQUFDLGdCQUFrQztJQUNoRSxNQUFNLGNBQWMsR0FBRztRQUNuQixHQUFHLEVBQUUsZ0JBQWdCLENBQUMsR0FBRztRQUN6QixVQUFVLEVBQUUsZ0JBQWdCLENBQUMsVUFBVSxJQUFJLFVBQVU7UUFDckQsY0FBYyxFQUFFLGdCQUFnQixDQUFDLGNBQWM7UUFDL0MsUUFBUSxFQUFFLGtCQUFrQixDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQztRQUNsRCxnQkFBZ0IsRUFBRSxnQkFBZ0IsQ0FBQyxnQkFBZ0IsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCO1FBQzVHLFVBQVUsRUFBRSxnQkFBZ0IsQ0FBQyxVQUFVLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLFVBQVU7UUFDMUYsbUJBQW1CLEVBQUUsZ0JBQWdCLENBQUMs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