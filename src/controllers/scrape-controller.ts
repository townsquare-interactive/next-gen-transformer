import { ImageFiles, scrape } from '../../api/scrapers/asset-scrape.js'
import { findPages } from '../../api/scrapers/page-list-scrape.js'
import { SaveFileMethodType, ScrapeImageReq } from '../schema/input-zod.js'
import { ScrapingError } from '../utilities/errors.js'
import { convertUrlToApexId } from '../utilities/utils.js'
import { removeDupeImages, renameDuplicateFiles } from '../../api/scrapers/utils.js'
import { deleteFolderS3 } from '../utilities/s3Functions.js'
import { ScrapedAndAnalyzedSiteData, ScrapedForm, ScrapedPageData, ScrapedPageSeo } from '../schema/output-zod.js'
import pLimit from 'p-limit'

export interface ScreenshotData {
    logoTag: string | null
    companyName: string | null
    address: string | null
    phoneNumber: string | null
    hours: string | null
    links: { socials: string[]; other: string[] }
}

export interface ScrapeResult {
    imageList: string[]
    imageFiles: ImageFiles[]
    pageSeo?: ScrapedPageSeo
    aiAnalysis?: ScreenshotData
    content: string
    forms: ScrapedForm[]
}

export interface ScrapeFullSiteResult {
    imageFiles: ImageFiles[]
    aiAnalysis?: ScreenshotData
    pageSeo?: ScrapedPageSeo
    seo: (ScrapedPageSeo | undefined)[]
    pagesData: ScrapedPageData[]
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
        const siteData: ScrapedAndAnalyzedSiteData = {
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

export async function getPageList(settings: Settings) {
    const scrapePagesFunction = settings.functions?.scrapePagesFunction || findPages

    try {
        const pages = await scrapePagesFunction(settings)

        return { pages }
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
    console.log('Starting scraping process...')

    if (pages.length === 0) {
        throw new Error('No pages to scrape.')
    }

    const homepage = pages[0] // First page is always the homepage
    const otherPages = pages.slice(1) // Remaining pages
    const limit = pLimit(3) // Limit concurrency

    try {
        // **Step 1: Scrape the homepage first**
        console.log('Scraping homepage:', homepage, 'individually...')
        const homepageData = await scrapeFunction({ ...settings, url: homepage }, 0)

        if (!homepageData) {
            throw new Error(`Failed to scrape homepage: ${homepage}`)
        }

        // Extract AI analysis from homepage (if available)
        const screenshotPageData = homepageData.aiAnalysis

        // Initialize storage for results
        const seo = [homepageData.pageSeo] // Start with homepage SEO data
        const imageFiles = [...homepageData.imageFiles] // Start with homepage images
        const pagesData = [
            {
                url: homepage,
                seo: homepageData.pageSeo,
                images: homepageData.imageList,
                content: homepageData.content,
                forms: homepageData.forms,
            },
        ]

        // **Step 2: Scrape other pages in parallel with limit**
        console.log('Starting limited parallel scraping for other pages...')
        const scrapedPages = await Promise.allSettled(
            otherPages.map((page, index) =>
                limit(async () => {
                    try {
                        console.log('Scraping page:', page, '...')
                        return await scrapeFunction({ ...settings, url: page }, index + 1)
                    } catch (err) {
                        console.error('Scrape function failed for page:', page, err)
                        return null // Handle failures gracefully
                        // throw err
                    }
                })
            )
        )

        // Extract successful results
        const validScrapedPages = scrapedPages.filter((res) => res.status === 'fulfilled' && res.value).map((res) => (res as PromiseFulfilledResult<any>).value)

        // Push results from other pages
        seo.push(...validScrapedPages.map((data) => data.pageSeo))
        imageFiles.push(...validScrapedPages.flatMap((data) => data.imageFiles))
        pagesData.push(
            ...validScrapedPages.map((data, index) => ({
                url: otherPages[index],
                seo: data.pageSeo,
                images: data.imageList,
                content: data.content,
                forms: data.forms,
            }))
        )

        // Remove duplicate images
        const imageFilesNoDuplicates = await removeDupeImages(imageFiles)
        const renamedDupes = renameDuplicateFiles(imageFilesNoDuplicates)

        return { imageFiles: renamedDupes, seo, aiAnalysis: screenshotPageData, pagesData }
    } catch (err) {
        console.error('Error during scraping:', err)
        throw err
    }
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
