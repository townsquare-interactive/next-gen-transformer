import { scrape } from '../../api/scrapers/image-scrape.js'
import { findPages } from '../../api/scrapers/page-list-scrape.js'
import { ScrapingError } from '../utilities/errors.js'
import { convertUrlToApexId } from '../utilities/utils.js'
export async function scrapeAssetsFromSite(settings) {
    const siteName = settings.url
    let attempt = 0
    let retries = settings.retries || 3
    let scrapeData
    const scrapeFunction = settings.functions?.scrapeFunction || scrape
    const scrapePagesFunction = settings.functions?.scrapePagesFunction || findPages
    console.log('retry count', retries)
    while (attempt < retries) {
        try {
            const pages = await scrapePagesFunction(settings)
            scrapeData = await scrapeDataFromPages(pages, settings, scrapeFunction)
            //create s3 scrape data
            const siteData = {
                baseUrl: settings.url,
                pages: pages,
                seoList: scrapeData.seoList,
                dudaUploadLocatoin: settings.uploadLocation,
            }
            console.log('scrape data result', scrapeData)
            return { imageNames: [], url: siteName, imageFiles: scrapeData.imageFiles, siteData: siteData }
        } catch (error) {
            console.error(`Attempt ${attempt + 1} failed. Retrying...`)
            attempt++
            if (attempt === retries) {
                console.error(`Failed to scrape after ${retries} attempts.`)
                throw new ScrapingError({
                    domain: settings.url,
                    message: error.message,
                    state: { scrapeStatus: 'URL not able to be scraped' },
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
export function getScrapeSettings(validatedRequest) {
    const scrapeSettings = {
        url: validatedRequest.url,
        savingMethod: validatedRequest.savingMethod,
        uploadLocation: validatedRequest.uploadLocation,
        basePath: convertUrlToApexId(validatedRequest.url),
    }
    return scrapeSettings
}
export const scrapeDataFromPages = async (pages, settings, scrapeFunction) => {
    //now time to scrape
    const imageFiles = []
    const seoList = []
    for (let n = 0; n < pages.length; n++) {
        try {
            console.log('scrape func 1')
            const imageData = await scrapeFunction({ ...settings, url: pages[n] })
            seoList.push(imageData.pageSeo) //push seo data for each page
            //push imagefiles for each page
            for (let i = 0; i < imageData.imageFiles.length; i++) {
                imageFiles.push(imageData.imageFiles[i])
            }
        } catch (err) {
            console.log('scrape funcion fail page: ', pages[n])
            throw err
        }
    }
    console.log('all seo', seoList)
    return { imageFiles: imageFiles, seoList: seoList }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NyYXBlLWNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29udHJvbGxlcnMvc2NyYXBlLWNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUE4QixNQUFNLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQTtBQUN2RixPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sd0NBQXdDLENBQUE7QUFHbEUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBQ3RELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHVCQUF1QixDQUFBO0FBMkIxRCxNQUFNLENBQUMsS0FBSyxVQUFVLG9CQUFvQixDQUFDLFFBQWtCO0lBQ3pELE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUE7SUFDN0IsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFBO0lBQ2YsSUFBSSxPQUFPLEdBQUcsUUFBUSxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUE7SUFDbkMsSUFBSSxVQUFVLENBQUE7SUFDZCxNQUFNLGNBQWMsR0FBRyxRQUFRLENBQUMsU0FBUyxFQUFFLGNBQWMsSUFBSSxNQUFNLENBQUE7SUFDbkUsTUFBTSxtQkFBbUIsR0FBRyxRQUFRLENBQUMsU0FBUyxFQUFFLG1CQUFtQixJQUFJLFNBQVMsQ0FBQTtJQUNoRixPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxPQUFPLENBQUMsQ0FBQTtJQUVuQyxPQUFPLE9BQU8sR0FBRyxPQUFPLEVBQUUsQ0FBQztRQUN2QixJQUFJLENBQUM7WUFDRCxNQUFNLEtBQUssR0FBRyxNQUFNLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxDQUFBO1lBQ2pELFVBQVUsR0FBRyxNQUFNLGNBQWMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLGNBQWMsQ0FBQyxDQUFBO1lBRWxFLHVCQUF1QjtZQUN2QixNQUFNLFFBQVEsR0FBRztnQkFDYixPQUFPLEVBQUUsUUFBUSxDQUFDLEdBQUc7Z0JBQ3JCLEtBQUssRUFBRSxLQUFLO2dCQUNaLE9BQU8sRUFBRSxVQUFVLENBQUMsT0FBTztnQkFDM0Isa0JBQWtCLEVBQUUsUUFBUSxDQUFDLGNBQWM7YUFDOUMsQ0FBQTtZQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLEVBQUUsVUFBVSxDQUFDLENBQUE7WUFDN0MsT0FBTyxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsVUFBVSxDQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUE7UUFDbkcsQ0FBQztRQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7WUFDYixPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsT0FBTyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQTtZQUMzRCxPQUFPLEVBQUUsQ0FBQTtZQUNULElBQUksT0FBTyxLQUFLLE9BQU8sRUFBRSxDQUFDO2dCQUN0QixPQUFPLENBQUMsS0FBSyxDQUFDLDBCQUEwQixPQUFPLFlBQVksQ0FBQyxDQUFBO2dCQUM1RCxNQUFNLElBQUksYUFBYSxDQUFDO29CQUNwQixNQUFNLEVBQUUsUUFBUSxDQUFDLEdBQUc7b0JBQ3BCLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTztvQkFDdEIsS0FBSyxFQUFFLEVBQUUsWUFBWSxFQUFFLDRCQUE0QixFQUFFO29CQUNyRCxTQUFTLEVBQUUsU0FBUztpQkFDdkIsQ0FBQyxDQUFBO1lBQ04sQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBRUQsTUFBTSxJQUFJLGFBQWEsQ0FBQztRQUNwQixNQUFNLEVBQUUsUUFBUSxDQUFDLEdBQUc7UUFDcEIsT0FBTyxFQUFFLCtDQUErQztRQUN4RCxLQUFLLEVBQUUsRUFBRSxZQUFZLEVBQUUsNEJBQTRCLEVBQUU7UUFDckQsU0FBUyxFQUFFLFNBQVM7S0FDdkIsQ0FBQyxDQUFBO0FBQ04sQ0FBQztBQUVELE1BQU0sVUFBVSxpQkFBaUIsQ0FBQyxnQkFBZ0M7SUFDOUQsTUFBTSxjQUFjLEdBQUc7UUFDbkIsR0FBRyxFQUFFLGdCQUFnQixDQUFDLEdBQUc7UUFDekIsWUFBWSxFQUFFLGdCQUFnQixDQUFDLFlBQVk7UUFDM0MsY0FBYyxFQUFFLGdCQUFnQixDQUFDLGNBQWM7UUFDL0MsUUFBUSxFQUFFLGtCQUFrQixDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQztLQUNyRCxDQUFBO0lBRUQsT0FBTyxjQUFjLENBQUE7QUFDekIsQ0FBQztBQUVELE1BQU0sQ0FBQyxNQUFNLGNBQWMsR0FBRyxLQUFLLEVBQUUsS0FBZSxFQUFFLFFBQWtCLEVBQUUsY0FBNkQsRUFBRSxFQUFFO0lBQ3ZJLG9CQUFvQjtJQUNwQixNQUFNLFVBQVUsR0FBRyxFQUFFLENBQUE7SUFDckIsTUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFBO0lBQ2xCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDcEMsSUFBSSxDQUFDO1lBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQTtZQUM1QixNQUFNLFNBQVMsR0FBRyxNQUFNLGNBQWMsQ0FBQyxFQUFFLEdBQUcsUUFBUSxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBRXRFLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFBLENBQUMsNkJBQTZCO1lBRTdELCtCQUErQjtZQUMvQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDbkQsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDNUMsQ0FBQztRQUNMLENBQUM7UUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1lBQ1gsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNuRCxNQUFNLEdBQUcsQ0FBQTtRQUNiLENBQUM7SUFDTCxDQUFDO0lBRUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUE7SUFFL0IsT0FBTyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxDQUFBO0FBQ3ZELENBQUMsQ0FBQSJ9
