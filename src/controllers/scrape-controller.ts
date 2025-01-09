import { ImageFiles, scrape } from '../../api/scrapers/asset-scrape.js'
import { findPages } from '../../api/scrapers/page-list-scrape.js'
import { SaveFileMethodType, ScrapeImageReq } from '../schema/input-zod.js'
import { ScrapingError } from '../utilities/errors.js'
import { convertUrlToApexId } from '../utilities/utils.js'
import { removeDupeImages, renameDuplicateFiles } from '../../api/scrapers/utils.js'
import { deleteFolderS3 } from '../utilities/s3Functions.js'

export interface ScrapedPageSeo {
    pageUrl: string
    title?: string
    metaDescription?: string
    metaKeywords?: string
    ogTitle?: string
}

export interface ScreenshotData {
    logoTag?: string
    companyName?: string
    address?: string
    phoneNumber?: string
    hours?: string
}

export interface ScrapeResult {
    imageList: string[]
    imageFiles: ImageFiles[]
    pageSeo?: ScrapedPageSeo
    screenshotAnalysis?: ScreenshotData
}

interface DeleteScrapedFolderRes {
    message: string
    url: string
    status: 'fail' | 'success'
}

type ScrapeFunctionType = (settings: Settings, n: number) => Promise<ScrapeResult>

export interface Settings extends ScrapeImageReq {
    saveMethod?: SaveFileMethodType
    timeoutLength?: number
    retries?: number
    functions?: { scrapeFunction?: ScrapeFunctionType; scrapePagesFunction?: (settings: Settings) => Promise<string[]> }
    basePath: string
}

export function getScrapeSettings(validatedRequest: ScrapeImageReq) {
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

export async function scrapeAssetsFromSite(settings: Settings) {
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
                screenshotAnalysis: scrapeData.screenshotAnalysis,
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

export const scrapeDataFromPages = async (pages: string[], settings: Settings, scrapeFunction: ScrapeFunctionType) => {
    //now time to scrape
    const imageFiles = []
    const seoList = []
    let screenshotPageData

    for (let n = 0; n < pages.length; n++) {
        try {
            console.log('scraping page ', pages[n], '.......')

            const imageData = await scrapeFunction({ ...settings, url: pages[n] }, n)
            seoList.push(imageData.pageSeo) //push seo data for each page

            if (imageData.screenshotAnalysis) {
                console.log('res sound')
                screenshotPageData = imageData.screenshotAnalysis
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

    return { imageFiles: renamedDupes, seoList: seoList, screenshotAnalysis: screenshotPageData }
}

export const removeScrapedFolder = async (url: string): Promise<DeleteScrapedFolderRes> => {
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
