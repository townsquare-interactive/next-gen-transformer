import { scrape } from '../../api/scrapers/asset-scrape.js'
import { findPages } from '../../api/scrapers/page-list-scrape.js'
import { ScrapingError } from '../utilities/errors.js'
import { convertUrlToApexId } from '../utilities/utils.js'
import { removeDupeImages, renameDuplicateFiles } from '../../api/scrapers/utils.js'
import { deleteFolderS3 } from '../utilities/s3Functions.js'
export function getScrapeSettings(validatedRequest) {
    const scrapeSettings = {
        url: validatedRequest.url,
        saveMethod: validatedRequest.saveMethod,
        uploadLocation: validatedRequest.uploadLocation,
        basePath: convertUrlToApexId(validatedRequest.url),
        backupImagesSave: validatedRequest.backupImagesSave === undefined ? true : validatedRequest.backupImagesSave,
        saveImages: validatedRequest.saveImages === undefined ? true : validatedRequest.saveImages,
        useAi: validatedRequest.useAi === undefined ? true : validatedRequest.useAi,
        scrapeImages: validatedRequest.scrapeImages === undefined ? true : validatedRequest.scrapeImages,
    }
    return scrapeSettings
}
export async function scrapeAssetsFromSite(settings) {
    const siteName = settings.url
    let attempt = 0
    let retries = settings.retries || 3
    const scrapeFunction = settings.functions?.scrapeFunction || scrape
    const scrapePagesFunction = settings.functions?.scrapePagesFunction || findPages
    console.log('retry count', retries)
    while (attempt < retries) {
        try {
            const pages = await scrapePagesFunction(settings)
            const scrapeData = await scrapeDataFromPages(pages, settings, scrapeFunction)
            //create s3 scrape data
            const siteData = {
                baseUrl: settings.url,
                pages: pages,
                seoList: scrapeData.seoList,
                dudaUploadLocation: settings.uploadLocation,
                aiAnalysis: scrapeData.aiAnalysis,
            }
            //console.log('scrape data result', scrapeData)
            return { imageNames: [], url: siteName, imageFiles: scrapeData.imageFiles, siteData: siteData }
        } catch (error) {
            console.error(`Attempt ${attempt + 1} failed. Retrying...`)
            attempt++
            if (attempt === retries) {
                console.error(`Failed to scrape after ${retries} attempts.`)
                throw new ScrapingError({
                    domain: settings.url,
                    message: error.message,
                    state: { scrapeStatus: 'Site not scraped' },
                    errorType: 'SCR-011',
                })
            }
        }
    }
    throw new ScrapingError({
        domain: settings.url,
        message: 'Unable to scrape site after multiple attempts',
        state: { scrapeStatus: 'URL not able to be scraped' },
        errorType: 'SCR-011',
    })
}
export const scrapeDataFromPages = async (pages, settings, scrapeFunction) => {
    //now time to scrape
    const imageFiles = []
    const seoList = []
    let screenshotPageData
    for (let n = 0; n < pages.length; n++) {
        try {
            console.log('scraping page ', pages[n], '.......')
            const imageData = await scrapeFunction({ ...settings, url: pages[n] }, n)
            seoList.push(imageData.pageSeo) //push seo data for each page
            if (imageData.aiAnalysis) {
                console.log('res sound')
                screenshotPageData = imageData.aiAnalysis
            }
            //push imagefiles for each page
            for (let i = 0; i < imageData.imageFiles.length; i++) {
                imageFiles.push(imageData.imageFiles[i])
            }
        } catch (err) {
            console.log('scrape funcion fail page: ', pages[n])
            throw err
        }
    }
    //remove duplicates in imageFiles
    const imageFilesNoDuplicates = await removeDupeImages(imageFiles)
    const renamedDupes = renameDuplicateFiles(imageFilesNoDuplicates)
    return { imageFiles: renamedDupes, seoList: seoList, aiAnalysis: screenshotPageData }
}
export const removeScrapedFolder = async (url) => {
    try {
        const siteFolderName = convertUrlToApexId(url)
        const scrapedFolder = `${siteFolderName}/scraped`
        const deleteStatus = await deleteFolderS3(scrapedFolder)
        console.log(deleteStatus)
        return { ...deleteStatus, url: url }
    } catch (err) {
        throw new ScrapingError({
            domain: url,
            message: err.message,
            state: { fileStatus: 'site data not deleted from S3' },
            errorType: 'SCR-014',
        })
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NyYXBlLWNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29udHJvbGxlcnMvc2NyYXBlLWNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFjLE1BQU0sRUFBRSxNQUFNLG9DQUFvQyxDQUFBO0FBQ3ZFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQTtBQUVsRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sd0JBQXdCLENBQUE7QUFDdEQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sdUJBQXVCLENBQUE7QUFDMUQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLG9CQUFvQixFQUFFLE1BQU0sNkJBQTZCLENBQUE7QUFDcEYsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDZCQUE2QixDQUFBO0FBeUM1RCxNQUFNLFVBQVUsaUJBQWlCLENBQUMsZ0JBQWdDO0lBQzlELE1BQU0sY0FBYyxHQUFHO1FBQ25CLEdBQUcsRUFBRSxnQkFBZ0IsQ0FBQyxHQUFHO1FBQ3pCLFVBQVUsRUFBRSxnQkFBZ0IsQ0FBQyxVQUFVO1FBQ3ZDLGNBQWMsRUFBRSxnQkFBZ0IsQ0FBQyxjQUFjO1FBQy9DLFFBQVEsRUFBRSxrQkFBa0IsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUM7UUFDbEQsZ0JBQWdCLEVBQUUsZ0JBQWdCLENBQUMsZ0JBQWdCLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLGdCQUFnQjtRQUM1RyxVQUFVLEVBQUUsZ0JBQWdCLENBQUMsVUFBVSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVO1FBQzFGLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxLQUFLLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLGdCQUFn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
