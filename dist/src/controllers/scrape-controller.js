import { scrape } from '../../api/scrapers/asset-scrape.js'
import { findPages } from '../../api/scrapers/page-list-scrape.js'
import { ScrapingError } from '../utilities/errors.js'
import { convertUrlToApexId } from '../utilities/utils.js'
import { removeDupeImages, renameDuplicateFiles } from '../../api/scrapers/utils.js'
import { deleteFolderS3 } from '../utilities/s3Functions.js'
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
    }
    return scrapeSettings
}
export async function scrapeAssetsFromSite(settings) {
    const siteName = settings.url
    const scrapeFunction = settings.functions?.scrapeFunction || scrape
    const scrapePagesFunction = settings.functions?.scrapePagesFunction || findPages
    try {
        const pages = await scrapePagesFunction(settings)
        const scrapeData = await scrapeDataFromPages(pages, settings, scrapeFunction)
        const transformedScrapedData = transformSiteScrapedData(scrapeData, siteName)
        //create s3 scrape data
        const siteData = {
            baseUrl: settings.url,
            pages: transformedScrapedData.pagesData,
            dudaUploadLocation: settings.uploadLocation || '',
            aiAnalysis: transformedScrapedData.aiAnalysis,
        }
        return { imageNames: [], url: siteName, imageFiles: transformedScrapedData.imageFiles, siteData: siteData }
    } catch (error) {
        console.error(error)
        throw new ScrapingError({
            domain: settings.url,
            message: error.message,
            state: { scrapeStatus: 'Site not scraped' },
            errorType: 'SCR-011',
        })
    }
}
const transformSiteScrapedData = (scrapeData, url) => {
    //remove links from same domain
    if (scrapeData.aiAnalysis?.links.other) {
        const extLinks = scrapeData.aiAnalysis.links.other.filter((link) => !link.includes(url))
        scrapeData.aiAnalysis.links.other = extLinks
    }
    return scrapeData
}
export const scrapeDataFromPages = async (pages, settings, scrapeFunction) => {
    //now time to scrape
    const imageFiles = []
    const seo = []
    const pagesData = []
    let screenshotPageData
    //scrape each page in the found list
    for (let n = 0; n < pages.length; n++) {
        try {
            console.log('scraping page ', pages[n], '.......')
            const scrapedPageData = await scrapeFunction({ ...settings, url: pages[n] }, n)
            seo.push(scrapedPageData.pageSeo) //push seo data for each page
            if (scrapedPageData.aiAnalysis) {
                screenshotPageData = scrapedPageData.aiAnalysis
            }
            //push imagefiles for each page
            for (let i = 0; i < scrapedPageData.imageFiles.length; i++) {
                imageFiles.push(scrapedPageData.imageFiles[i])
            }
            pagesData.push({
                url: pages[n],
                seo: scrapedPageData.pageSeo,
                images: scrapedPageData.imageList,
                content: scrapedPageData.content,
            })
        } catch (err) {
            console.log('scrape function fail page: ', pages[n])
            throw err
        }
    }
    //remove duplicates in imageFiles
    const imageFilesNoDuplicates = await removeDupeImages(imageFiles)
    const renamedDupes = renameDuplicateFiles(imageFilesNoDuplicates)
    return { imageFiles: renamedDupes, seo: seo, aiAnalysis: screenshotPageData, pagesData: pagesData }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NyYXBlLWNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29udHJvbGxlcnMvc2NyYXBlLWNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFjLE1BQU0sRUFBRSxNQUFNLG9DQUFvQyxDQUFBO0FBQ3ZFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQTtBQUVsRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sd0JBQXdCLENBQUE7QUFDdEQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sdUJBQXVCLENBQUE7QUFDMUQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLG9CQUFvQixFQUFFLE1BQU0sNkJBQTZCLENBQUE7QUFDcEYsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDZCQUE2QixDQUFBO0FBbUQ1RCxNQUFNLFVBQVUsaUJBQWlCLENBQUMsZ0JBQWdDO0lBQzlELE1BQU0sY0FBYyxHQUFHO1FBQ25CLEdBQUcsRUFBRSxnQkFBZ0IsQ0FBQyxHQUFHO1FBQ3pCLFVBQVUsRUFBRSxnQkFBZ0IsQ0FBQyxVQUFVLElBQUksVUFBVTtRQUNyRCxjQUFjLEVBQUUsZ0JBQWdCLENBQUMsY0FBYztRQUMvQyxRQUFRLEVBQUUsa0JBQWtCLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDO1FBQ2xELGdCQUFnQixFQUFFLGdCQUFnQixDQUFDLGdCQUFnQixLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0I7UUFDNUcsVUFBVSxFQUFFLGdCQUFnQixDQUFDLFVBQVUsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsVUFBVTtRQUMxRixLQUFLLEVBQUUsZ0JBQWdCLENBQUMsS0FBSyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLO1FBQzNFLFlBQVksRUFBRSxnQkFBZ0IsQ0FBQyxZQUFZLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLFlBQVk7S0FDbkcsQ0FBQTtJQUVELE9BQU8sY0FBYyxDQUFBO0FBQ3pCLENBQUM7QUFFRCxNQUFNLENBQUMsS0FBSyxVQUFVLG9CQUFvQixDQUFDLFFBQWtCO0lBQ3pELE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUE7SUFDN0IsTUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDLFNBQVMsRUFBRSxjQUFjLElBQUksTUFBTSxDQUFBO0lBQ25FLE1BQU0sbUJBQW1CLEdBQUcsUUFBUSxDQUFDLFNBQVMsRUFBRSxtQkFBbUIsSUFBSSxTQUFTLENBQUE7SUFFaEYsSUFBSSxDQUFDO1FBQ0QsTUFBTSxLQUFLLEdBQUcsTUFBTSxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUNqRCxNQUFNLFVBQVUsR0FBRyxNQUFNLG1CQUFtQixDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsY0FBYyxDQUFDLENBQUE7UUFDN0UsTUFBTSxzQkFBc0IsR0FBRyx3QkFBd0IsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUE7UUFFN0UsdUJBQXVCO1FBQ3ZCLE1BQU0sUUFBUSxHQUErQjtZQUN6QyxPQUFPLEVBQUUsUUFBUSxDQUFDLEdBQUc7WUFDckIsS0FBSyxFQUFFLHNCQUFzQixDQUFDLFNBQVM7WUFDdkMsa0JBQWtCLEVBQUUsUUFBUSxDQUFDLGNBQWMsSUFBSSxFQUFFO1lBQ2pELFVBQVUsRUFBRSxzQkFBc0IsQ0FBQyxVQUFVO1NBQ2hELENBQUE7UUFFRCxPQUFPLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxzQkFBc0IsQ0FBQyxVQUFVLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxDQUFBO0lBQy9HLENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2IsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUNwQixNQUFNLElBQUksYUFBYSxDQUFDO1lBQ3BCLE1BQU0sRUFBRSxRQUFRLENBQUMsR0FBRztZQUNwQixPQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU87WUFDdEIsS0FBSyxFQUFFLEVBQUUsWUFBWSxFQUFFLGtCQUFrQixFQUFFO1lBQzNDLFNBQVMsRUFBRSxTQUFTO1NBQ3ZCLENBQUMsQ0FBQTtJQUNOLENBQUM7QUFDTCxDQUFDO0FBRUQsTUFBTSx3QkFBd0IsR0FBRyxDQUFDLFVBQWdDLEVBQUUsR0FBVyxFQUFFLEVBQUU7SUFDL0UsK0JBQStCO0lBQy9CLElBQUksVUFBVSxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDckMsTUFBTSxRQUFRLEdBQUcsVUFBVSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQVksRUFBRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7UUFFaEcsVUFBVSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQTtJQUNoRCxDQUFDO0lBRUQsT0FBTyxVQUFVLENBQUE7QUFDckIsQ0FBQyxDQUFBO0FBRUQsTUFBTSxDQUFDLE1BQU0sbUJBQW1CLEdBQUcsS0FBSyxFQUFFLEtBQWUsRUFBRSxRQUFrQixFQUFFLGNBQWtDLEVBQUUsRUFBRTtJQUNqSCxvQkFBb0I7SUFDcEIsTUFBTSxVQUFVLEdBQUcsRUFBRSxDQUFBO0lBQ3JCLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQTtJQUNkLE1BQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQTtJQUNwQixJQUFJLGtCQUFrQixDQUFBO0lBRXRCLG9DQUFvQztJQUNwQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQ3BDLElBQUksQ0FBQztZQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFBO1lBRWxELE1BQU0sZUFBZSxHQUFHLE1BQU0sY0FBYyxDQUFDLEVBQUUsR0FBRyxRQUFRLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFBO1lBQy9FLEdBQUcsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFBLENBQUMsNkJBQTZCO1lBRS9ELElBQUksZUFBZSxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUM3QixrQkFBa0IsR0FBRyxlQUFlLENBQUMsVUFBVSxDQUFBO1lBQ25ELENBQUM7WUFFRCwrQkFBK0I7WUFDL0IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGVBQWUsQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQ3pELFVBQVUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2xELENBQUM7WUFFRCxTQUFTLENBQUMsSUFBSSxDQUFDO2dCQUNYLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUNiLEdBQUcsRUFBRSxlQUFlLENBQUMsT0FBTztnQkFDNUIsTUFBTSxFQUFFLGVBQWUsQ0FBQyxTQUFTO2dCQUNqQyxPQUFPLEVBQUUsZUFBZSxDQUFDLE9BQU87YUFDbkMsQ0FBQyxDQUFBO1FBQ04sQ0FBQztRQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7WUFDWCxPQUFPLENBQUMsR0FBRyxDQUFDLDZCQUE2QixFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ3BELE1BQU0sR0FBRyxDQUFBO1FBQ2IsQ0FBQztJQUNMLENBQUM7SUFFRCxpQ0FBaUM7SUFDakMsTUFBTSxzQkFBc0IsR0FBRyxNQUFNLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFBO0lBQ2pFLE1BQU0sWUFBWSxHQUFHLG9CQUFvQixDQUFDLHNCQUFzQixDQUFDLENBQUE7SUFFakUsT0FBTyxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsa0JBQWtCLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxDQUFBO0FBQ3ZHLENBQUMsQ0FBQTtBQUVELE1BQU0sQ0FBQyxNQUFNLG1CQUFtQixHQUFHLEtBQUssRUFBRSxHQUFXLEVBQW1DLEVBQUU7SUFDdEYsSUFBSSxDQUFDO1FBQ0QsTUFBTSxjQUFjLEdBQUcsa0JBQWtCLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDOUMsTUFBTSxhQUFhLEdBQUcsR0FBRyxjQUFjLFVBQVUsQ0FBQTtRQUNqRCxNQUFNLFlBQVksR0FBRyxNQUFNLGNBQWMsQ0FBQyxhQUFhLENBQUMsQ0FBQTtRQUN4RCxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFBO1FBQ3pCLE9BQU8sRUFBRSxHQUFHLFlBQVksRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7SUFDeEMsQ0FBQztJQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDWCxNQUFNLElBQUksYUFBYSxDQUFDO1lBQ3BCLE1BQU0sRUFBRSxHQUFHO1lBQ1gsT0FBTyxFQUFFLEdBQUcsQ0FBQyxPQUFPO1lBQ3BCLEtBQUssRUFBRSxFQUFFLFVBQVUsRUFBRSwrQkFBK0IsRUFBRTtZQUN0RCxTQUFTLEVBQUUsU0FBUztTQUN2QixDQUFDLENBQUE7SUFDTixDQUFDO0FBQ0wsQ0FBQyxDQUFBIn0=
