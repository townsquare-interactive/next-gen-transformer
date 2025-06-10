import { ImageFiles, scrape } from '../api/scrapers/asset-scrape.js'
import { findPages } from '../api/scrapers/page-list-scrape.js'
import { SaveFileMethodType, ScrapeWebsiteReq } from '../schema/input-zod.js'
import { ScrapingError } from '../utilities/errors.js'
import { convertUrlToApexId } from '../utilities/utils.js'
import {
    checkPagesAreOnSameDomain,
    combineBusinessData,
    isAnalyzePage,
    removeDupeImages,
    renameDuplicateFiles,
    transformScrapedPageData,
    validHours,
} from '../api/scrapers/utils.js'
import { deleteFolderS3, getFileS3 } from '../utilities/s3Functions.js'
import { ScrapedAndAnalyzedSiteData, ScrapedForm, ScrapedPageData, ScrapedPageSeo, ScreenshotData } from '../schema/output-zod.js'
import pLimit from 'p-limit'
import { save, ScrapedDataToSave } from '../output/save-scraped-data.js'
import { defaultHeaders } from '../api/scrapers/playwright-setup.js'
import { transformBusinessInfo } from '../api/scrapers/utils.js'
import { s3ScrapedSitesFolder } from '../api/scrapers/constants.js'
import { ContentLibraryResponse } from '@dudadev/partner-api/dist/types/lib/content/types.js'
import { scrapeInfoDocName } from '../api/scrapers/constants.js'
export interface ScrapeResult {
    imageList: string[]
    imageFiles: ImageFiles[]
    pageSeo?: ScrapedPageSeo
    businessInfo?: ScreenshotData
    content: string
    forms: ScrapedForm[]
    iframeContent?: string[]
}

export interface ScrapeFullSiteResult {
    imageFiles: ImageFiles[]
    businessInfo?: ScreenshotData
    pageSeo?: ScrapedPageSeo
    seo: (ScrapedPageSeo | undefined)[]
    pagesData: ScrapedPageData[]
    siteSeo?: ScrapedPageSeo
    iframeContent?: string[]
}

interface DeleteScrapedFolderRes {
    message: string
    url: string
    status: 'fail' | 'success'
}

type ScrapeFunctionType = (settings: Settings, n: number, analyzePage?: boolean) => Promise<ScrapeResult>

export interface Settings extends ScrapeWebsiteReq {
    saveMethod?: SaveFileMethodType
    timeoutLength?: number
    functions?: {
        scrapeFunction?: ScrapeFunctionType
        scrapePagesFunction?: (settings: Settings) => Promise<string[]>
        isValidateUrl?: (url: string) => Promise<boolean>
        getBusinessInfo?: (siteId: string) => Promise<ContentLibraryResponse>
    }
    basePath: string
    queueScrape?: boolean
    siteType?: 'priority' | 'secondary'
}

export function getScrapeSettings(validatedRequest: ScrapeWebsiteReq) {
    const scrapeSettings = {
        url: validatedRequest.url,
        saveMethod: validatedRequest.saveMethod || 's3Upload',
        uploadLocation: validatedRequest.uploadLocation,
        basePath: convertUrlToApexId(validatedRequest.url),
        backupImagesSave: validatedRequest.backupImagesSave === undefined ? true : validatedRequest.backupImagesSave,
        saveImages: validatedRequest.saveImages === undefined ? true : validatedRequest.saveImages,
        scrapeImages: validatedRequest.scrapeImages === undefined ? true : validatedRequest.scrapeImages,
        queueScrape: validatedRequest.queueScrape === undefined ? false : validatedRequest.queueScrape,
        siteType: validatedRequest.siteType === undefined ? 'priority' : validatedRequest.siteType,
    }

    return scrapeSettings
}

export async function scrapeAssetsFromSite(settings: Settings, pages?: string[], retries = 3) {
    const siteName = settings.url
    const scrapeFunction = settings.functions?.scrapeFunction || scrape
    const scrapePagesFunction = settings.functions?.scrapePagesFunction || findPages
    const isValidateUrl = settings.functions?.isValidateUrl || isValidHtmlPage
    const MAX_RETRIES = retries

    try {
        //confirm base URL returns HTML
        if (!(await isValidateUrl(settings.url))) {
            throw { message: `Invalid or non-HTML page: ${settings.url}`, errorType: 'SCR-011' }
        }

        //retry scraping process if it fails initially
        let lastError
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                const pagesToScrape = pages ? pages : await scrapePagesFunction(settings)
                checkPagesAreOnSameDomain(settings.url, pagesToScrape)
                const scrapeData = await scrapeDataFromPages(pagesToScrape, settings, scrapeFunction)
                const transformedScrapedData = transformSiteScrapedData(scrapeData, siteName)

                const siteData: ScrapedAndAnalyzedSiteData = {
                    baseUrl: settings.url,
                    pages: transformedScrapedData.pagesData,
                    dudaUploadLocation: settings.uploadLocation || '',
                    businessInfo: transformedScrapedData.businessInfo,
                    siteSeo: transformedScrapedData.siteSeo,
                    iframeContent: transformedScrapedData.iframeContent,
                }

                return {
                    imageNames: [],
                    url: siteName,
                    imageFiles: transformedScrapedData.imageFiles,
                    siteData: siteData,
                }
            } catch (error) {
                lastError = error
                console.error(`Scraping attempt ${attempt} failed:`, error)
                if (attempt === MAX_RETRIES) {
                    throw lastError
                }
                console.log(`Retrying... (Attempt ${attempt + 1} of ${MAX_RETRIES})`)
                // Optional: Add delay between retries
                await new Promise((resolve) => setTimeout(resolve, 3000 * attempt))
            }
        }
        throw lastError
    } catch (error) {
        console.error(error)
        throw new ScrapingError({
            domain: settings.url,
            message: error.message,
            state: { scrapeStatus: 'Site not scraped' },
            errorType: error.errorType || 'GEN-003',
        })
    }
}

export async function getPageList(settings: Settings) {
    const scrapePagesFunction = settings.functions?.scrapePagesFunction || findPages
    const isValidateUrl = settings.functions?.isValidateUrl || isValidHtmlPage

    try {
        if (!(await isValidateUrl(settings.url))) {
            throw { message: `Invalid or non-HTML page: ${settings.url}`, errorType: 'SCR-011' }
        }

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
    //get site SEO from home page
    if (scrapeData.pagesData[0]?.seo) {
        scrapeData.siteSeo = scrapeData.pagesData[0].seo
    }

    //analyzed data from openai
    if (scrapeData.businessInfo) {
        scrapeData.businessInfo = transformBusinessInfo(scrapeData.businessInfo, url)
    }

    if (scrapeData.pagesData) {
        scrapeData.pagesData = transformScrapedPageData(scrapeData.pagesData)
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

    // **Step 1: Scrape the homepage first**
    console.log('Scraping homepage:', homepage, 'individually...')
    const homepageData = await scrapeFunction({ ...settings, url: homepage }, 0, true)

    if (!homepageData) {
        throw new Error(`Failed to scrape homepage: ${homepage}`)
    }

    //analyze contact page if hours were not found on the home page
    let analyzeContactPage = true
    if (homepageData.businessInfo?.hours?.regularHours) {
        analyzeContactPage = !validHours(homepageData.businessInfo.hours)
    }

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
    const iframeContent = homepageData.iframeContent || []

    // **Step 2: Scrape other pages in parallel with limit**
    console.log('Starting limited parallel scraping for other pages...')
    const scrapedPages = await Promise.allSettled(
        otherPages.map((page, index) =>
            limit(async () => {
                try {
                    console.log('Scraping page:', page, '...')
                    return await scrapeFunction({ ...settings, url: page }, index + 1, isAnalyzePage(page, analyzeContactPage))
                } catch (err) {
                    console.error('Scrape function failed for page:', page, err)
                    return null // Handle failures gracefully for inner pages
                }
            })
        )
    )
    //ScrapedPageData
    // Extract successful results
    const validScrapedPages = scrapedPages
        .filter((res) => res.status === 'fulfilled' && res.value)
        .map((res) => (res as PromiseFulfilledResult<ScrapeResult>).value)

    //combine business data from each page
    const internalBusinessData = validScrapedPages.map((data) => data.businessInfo)
    let screenshotPageData = homepageData.businessInfo
    if (internalBusinessData.length >= 1 && analyzeContactPage) {
        const combinedBusinessData = combineBusinessData(homepageData.businessInfo, internalBusinessData)
        // Use the combined data instead of just homepage data
        screenshotPageData = combinedBusinessData || homepageData.businessInfo
    }

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
    iframeContent.push(...validScrapedPages.flatMap((data) => data.iframeContent || []))

    // Remove duplicate images
    const imageFilesNoDuplicates = await removeDupeImages(imageFiles)
    const renamedDupes = renameDuplicateFiles(imageFilesNoDuplicates)

    return { imageFiles: renamedDupes, seo, businessInfo: screenshotPageData, pagesData, iframeContent }
}

export const removeScrapedFolder = async (url: string): Promise<DeleteScrapedFolderRes> => {
    try {
        const siteFolderName = convertUrlToApexId(url)
        const scrapedFolder = `${s3ScrapedSitesFolder}${siteFolderName}/scraped`
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

async function isValidHtmlPage(url: string): Promise<boolean> {
    console.log('confirming URL is valid:', url)
    try {
        const response = await fetch(url, {
            method: 'HEAD',
            headers: defaultHeaders,
        })
        console.log('Response status:', response.status)

        // Consider both 200 OK and 403 Cloudflare responses as valid if they return HTML
        const contentType = response.headers.get('content-type')

        if (contentType?.includes('text/html')) {
            return true
        }

        // If not HTML or no content type, then it's not valid
        return false
    } catch (error) {
        console.error(`Failed to fetch ${url}:`, error)
        return false
    }
}

export const getScrapedDataFromS3 = async (url: string, getFileFunction?: (url: string) => Promise<ScrapedAndAnalyzedSiteData>) => {
    const getFile = getFileFunction || getFileS3
    const siteFolderName = convertUrlToApexId(url)
    const scrapedFolder = `${s3ScrapedSitesFolder}${siteFolderName}/scraped`
    const siteDataPath = scrapedFolder + '/siteData.json'
    const scrapedData = await getFile(siteDataPath, null)
    if (!scrapedData) {
        throw new ScrapingError({
            domain: url,
            message: 'Scraped data not found in S3',
            errorType: 'AMS-006',
            state: { scrapeStatus: 'Scraped data not found in S3' },
        })
    }

    //throw error if error logs found in S3
    if (scrapedData.error) {
        const foundError = scrapedData.error
        throw new ScrapingError({
            domain: foundError.error.url || '',
            message: 'Error during scraping: ' + foundError.message,
            errorType: foundError.error.errorType,
            state: { id: foundError.id, ...foundError.error.state, stack: foundError.stack, date: foundError.date },
        })
    }
    return scrapedData
}

export const getScrapedInfoDocFromS3 = async (url: string, getFileFunction?: (url: string) => Promise<ScrapedAndAnalyzedSiteData>) => {
    const getFile = getFileFunction || getFileS3
    const siteFolderName = convertUrlToApexId(url)
    const scrapedFolder = `${s3ScrapedSitesFolder}${siteFolderName}/scraped`
    const siteDataPath = scrapedFolder + `/${scrapeInfoDocName}.txt`
    const scrapedInfo = await getFile(siteDataPath, null)
    if (!scrapedInfo) {
        throw new ScrapingError({
            domain: url,
            message: 'Scraped info doc not found in S3',
            errorType: 'AMS-006',
            state: { scrapeStatus: 'Asset doc never uploaded' },
        })
    }
    return scrapedInfo
}

export const moveS3DataToDuda = async (siteData: ScrapedAndAnalyzedSiteData, uploadLocation: string, siteType: 'priority' | 'secondary') => {
    const scrapedData: ScrapedDataToSave = {
        imageNames: [],
        url: siteData.baseUrl,
        imageFiles: [],
        imageList: siteData.assetData?.s3UploadedImages,
        siteData: siteData,
    }

    const settings: Settings = {
        url: siteData.baseUrl,
        saveMethod: 'dudaUpload',
        uploadLocation: uploadLocation,
        basePath: siteData.baseUrl,
        backupImagesSave: false,
        saveImages: true,
        siteType: siteType,
    }

    const savedData = await save(settings, scrapedData)

    return savedData
}
