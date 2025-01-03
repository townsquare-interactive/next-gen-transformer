import { scrape } from '../../api/scrapers/asset-scrape.js';
import { findPages } from '../../api/scrapers/page-list-scrape.js';
import { ScrapingError } from '../utilities/errors.js';
import { convertUrlToApexId } from '../utilities/utils.js';
import { removeDupeImages, renameDuplicateFiles } from '../../api/scrapers/utils.js';
import { deleteFolderS3 } from '../utilities/s3Functions.js';
export function getScrapeSettings(validatedRequest) {
    const scrapeSettings = {
        url: validatedRequest.url,
        savingMethod: validatedRequest.savingMethod,
        uploadLocation: validatedRequest.uploadLocation,
        basePath: convertUrlToApexId(validatedRequest.url),
        backupImagesSave: validatedRequest.backupImagesSave === undefined ? true : validatedRequest.backupImagesSave,
        saveImages: validatedRequest.saveImages === undefined ? true : validatedRequest.saveImages,
        useAi: validatedRequest.useAi || false,
        scrapeImages: validatedRequest.scrapeImages === undefined ? true : validatedRequest.scrapeImages,
    };
    return scrapeSettings;
}
export async function scrapeAssetsFromSite(settings) {
    const siteName = settings.url;
    let attempt = 0;
    let retries = settings.retries || 3;
    const scrapeFunction = settings.functions?.scrapeFunction || scrape;
    const scrapePagesFunction = settings.functions?.scrapePagesFunction || findPages;
    console.log('retry count', retries);
    while (attempt < retries) {
        try {
            const pages = await scrapePagesFunction(settings);
            const scrapeData = await scrapeDataFromPages(pages, settings, scrapeFunction);
            //create s3 scrape data
            const siteData = {
                baseUrl: settings.url,
                pages: pages,
                seoList: scrapeData.seoList,
                dudaUploadLocation: settings.uploadLocation,
                screenshotAnalysis: scrapeData.screenshotAnalysis,
            };
            //console.log('scrape data result', scrapeData)
            return { imageNames: [], url: siteName, imageFiles: scrapeData.imageFiles, siteData: siteData };
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
}
export const scrapeDataFromPages = async (pages, settings, scrapeFunction) => {
    //now time to scrape
    const imageFiles = [];
    const seoList = [];
    let screenshotPageData;
    for (let n = 0; n < pages.length; n++) {
        try {
            console.log('scraping page ', pages[n], '.......');
            const imageData = await scrapeFunction({ ...settings, url: pages[n] }, n);
            seoList.push(imageData.pageSeo); //push seo data for each page
            if (imageData.screenshotAnalysis) {
                console.log('res sound');
                screenshotPageData = imageData.screenshotAnalysis;
            }
            //push imagefiles for each page
            for (let i = 0; i < imageData.imageFiles.length; i++) {
                imageFiles.push(imageData.imageFiles[i]);
            }
        }
        catch (err) {
            console.log('scrape funcion fail page: ', pages[n]);
            throw err;
        }
    }
    //remove duplicates in imageFiles
    const imageFilesNoDuplicates = await removeDupeImages(imageFiles);
    const renamedDupes = renameDuplicateFiles(imageFilesNoDuplicates);
    return { imageFiles: renamedDupes, seoList: seoList, screenshotAnalysis: screenshotPageData };
};
export const removeScrapedFolder = async (url) => {
    try {
        const siteFolderName = convertUrlToApexId(url);
        const scrapedFolder = `${siteFolderName}/scraped`;
        const deleteStatus = await deleteFolderS3(scrapedFolder);
        console.log(deleteStatus);
        return deleteStatus;
    }
    catch (err) {
        throw 'error deleting folder';
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NyYXBlLWNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29udHJvbGxlcnMvc2NyYXBlLWNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFjLE1BQU0sRUFBRSxNQUFNLG9DQUFvQyxDQUFBO0FBQ3ZFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQTtBQUVsRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sd0JBQXdCLENBQUE7QUFDdEQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sdUJBQXVCLENBQUE7QUFDMUQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLG9CQUFvQixFQUFFLE1BQU0sNkJBQTZCLENBQUE7QUFDcEYsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDZCQUE2QixDQUFBO0FBd0M1RCxNQUFNLFVBQVUsaUJBQWlCLENBQUMsZ0JBQWdDO0lBQzlELE1BQU0sY0FBYyxHQUFHO1FBQ25CLEdBQUcsRUFBRSxnQkFBZ0IsQ0FBQyxHQUFHO1FBQ3pCLFlBQVksRUFBRSxnQkFBZ0IsQ0FBQyxZQUFZO1FBQzNDLGNBQWMsRUFBRSxnQkFBZ0IsQ0FBQyxjQUFjO1FBQy9DLFFBQVEsRUFBRSxrQkFBa0IsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUM7UUFDbEQsZ0JBQWdCLEVBQUUsZ0JBQWdCLENBQUMsZ0JBQWdCLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLGdCQUFnQjtRQUM1RyxVQUFVLEVBQUUsZ0JBQWdCLENBQUMsVUFBVSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVO1FBQzFGLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxLQUFLLElBQUksS0FBSztRQUN0QyxZQUFZLEVBQUUsZ0JBQWdCLENBQUMsWUFBWSxLQUFLLFNB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