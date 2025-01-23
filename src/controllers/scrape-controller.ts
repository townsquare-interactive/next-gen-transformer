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
    links: { socials: string[]; other: string[] }
}

export interface ScrapeResult {
    imageList: string[]
    imageFiles: ImageFiles[]
    pageSeo?: ScrapedPageSeo
    aiAnalysis?: ScreenshotData
    content: string
}

export interface ScrapeFullSiteResult {
    imageFiles: ImageFiles[]
    aiAnalysis?: ScreenshotData
    pageSeo?: ScrapedPageSeo
    seoList: (ScrapedPageSeo | undefined)[]
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
    functions?: { scrapeFunction?: ScrapeFunctionType; scrapePagesFunction?: (settings: Settings) => Promise<string[]> }
    basePath: string
}

export function getScrapeSettings(validatedRequest: ScrapeImageReq) {
    const scrapeSettings = {
        url: validatedRequest.url,
        saveMethod: validatedRequest.saveMethod || 's3Upload',
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
    const scrapeFunction = settings.functions?.scrapeFunction || scrape
    const scrapePagesFunction = settings.functions?.scrapePagesFunction || findPages

    try {
        const pages = await scrapePagesFunction(settings)
        const scrapeData = await scrapeDataFromPages(pages, settings, scrapeFunction)
        const transformedScrapedData = transformSiteScrapedData(scrapeData, siteName)

        //create s3 scrape data
        const siteData = {
            baseUrl: settings.url,
            pages: scrapeData.pagesData,
            seoList: transformedScrapedData.seoList,
            dudaUploadLocation: settings.uploadLocation,
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

const transformSiteScrapedData = (scrapeData: ScrapeFullSiteResult, url: string) => {
    //remove links from same domain
    if (scrapeData.aiAnalysis?.links.other) {
        const extLinks = scrapeData.aiAnalysis.links.other.filter((link: string) => !link.includes(url))

        scrapeData.aiAnalysis.links.other = extLinks
    }

    return scrapeData
}

export const scrapeDataFromPages = async (pages: string[], settings: Settings, scrapeFunction: ScrapeFunctionType) => {
    //now time to scrape
    const imageFiles = []
    const seoList = []
    const pagesData = []
    let screenshotPageData

    //scrape each page in the found list
    for (let n = 0; n < pages.length; n++) {
        try {
            console.log('scraping page ', pages[n], '.......')

            const scrapedPageData = await scrapeFunction({ ...settings, url: pages[n] }, n)
            seoList.push(scrapedPageData.pageSeo) //push seo data for each page

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

    return { imageFiles: renamedDupes, seoList: seoList, aiAnalysis: screenshotPageData, pagesData: pagesData }
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
