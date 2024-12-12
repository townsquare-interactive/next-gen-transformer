import { ImageFiles, scrape } from '../../api/scrapers/asset-scrape.js'
import { findPages } from '../../api/scrapers/page-list-scrape.js'
import { SaveFileMethodType, ScrapeImageReq } from '../schema/input-zod.js'
import { ScrapingError } from '../utilities/errors.js'
import { convertUrlToApexId } from '../utilities/utils.js'

export interface ScrapedPageSeo {
    pageUrl: string
    title?: string
    metaDescription?: string
    metaKeywords?: string
    ogTitle?: string
    ogDescription?: string
}

interface ScrapeResult {
    imageList: string[]
    imageFiles: ImageFiles[]
    pageSeo?: ScrapedPageSeo
}

export interface Settings {
    url: string
    saveMethod?: SaveFileMethodType
    timeoutLength?: number
    retries?: number
    functions?: { scrapeFunction?: (settings: Settings) => Promise<ScrapeResult>; scrapePagesFunction?: (settings: Settings) => Promise<string[]> }
    uploadLocation?: string
    basePath: string
}

export function getScrapeSettings(validatedRequest: ScrapeImageReq) {
    const scrapeSettings = {
        url: validatedRequest.url,
        savingMethod: validatedRequest.savingMethod,
        uploadLocation: validatedRequest.uploadLocation,
        basePath: convertUrlToApexId(validatedRequest.url),
    }

    return scrapeSettings
}

export async function scrapeAssetsFromSite(settings: Settings) {
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
            scrapeData = await scrapeAllPages(pages, settings, scrapeFunction)

            //create s3 scrape data
            const siteData = {
                baseUrl: settings.url,
                pages: pages,
                seoList: scrapeData.seoList,
                dudaUploadLocation: settings.uploadLocation,
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

export const scrapeAllPages = async (pages: string[], settings: Settings, scrapeFunction: (settings: Settings) => Promise<ScrapeResult>) => {
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
