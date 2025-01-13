import type { ImageFiles, ScrapeSiteData } from '../../api/scrapers/asset-scrape.js'
import { ScrapingError } from '../utilities/errors.js'
import { save as WriteToFile } from '../services/write-to-folder.js'
import { save as s3FileUpload } from '../services/s3-images-upload.js'
import { save as batchUploadToDuda } from '../services/save-to-duda.js'
import { addFileS3 } from '../utilities/s3Functions.js'
import type { ScrapedPageSeo, ScreenshotData, Settings } from '../controllers/scrape-controller.js'

export interface SaveOutput {
    uploadedImages: any[]
    imageUploadCount: number
    failedImageList: string[]
    logoUrl?: string
}

interface ScrapedDataToSave {
    imageNames: never[]
    url: string
    imageFiles: any[]
    siteData: {
        baseUrl: string
        pages: string[]
        seoList: (ScrapedPageSeo | undefined)[]
        dudaUploadLocation: string | undefined
        screenshotAnalysis?: ScreenshotData
    }
}

export const save = async (settings: Settings, scrapedData: ScrapedDataToSave) => {
    if (settings.saveImages) {
        let s3SavedRes
        //save to s3 by default (backupImagesSave defaults to true if not in params)
        if (settings.backupImagesSave || settings.saveMethod === 's3Upload') {
            s3SavedRes = await saveScrapedData({ ...settings, saveMethod: 's3Upload' }, scrapedData.imageFiles, scrapedData.siteData)
        }

        let saveServiceRes
        if (settings.saveMethod != 's3Upload') {
            saveServiceRes = await saveScrapedData(settings, scrapedData.imageFiles, scrapedData.siteData, s3SavedRes?.imageData?.logoUrl || '')
        }
        const savedInfoResponse = saveServiceRes || s3SavedRes

        return {
            imageUploadTotal: savedInfoResponse?.imageData.imageUploadTotal || 0,
            failedImageCount: savedInfoResponse?.imageData.failedImageList.length || 0,
            uploadedResources: savedInfoResponse?.imageData.uploadedResources || [],
            s3UploadedImages: s3SavedRes?.imageData.uploadedResources || [],
            failedImages: savedInfoResponse?.imageData.failedImageList || [],
            s3LogoUrl: s3SavedRes?.imageData?.logoUrl || '',
            scrapedPages: scrapedData.siteData.pages,
            url: scrapedData.url,
            siteData: scrapedData.siteData,
        }
    } else {
        return { message: 'Scrape complete: no images uploaded', scrapedPages: scrapedData.siteData.pages, url: scrapedData.url }
    }
}

export const saveScrapedData = async (settings: Settings, imageFiles: ImageFiles[], siteData: ScrapeSiteData, logoUrl?: string) => {
    try {
        const savedImages = await saveScrapedImages(settings, imageFiles, logoUrl)

        if (settings.saveMethod === 's3Upload') {
            await savePageDataToS3(settings, { ...siteData, s3LogoUrl: savedImages.logoUrl || '' })
        }

        return {
            imageData: {
                uploadedResources: savedImages.uploadedImages,
                imageUploadTotal: savedImages.imageUploadCount,
                failedImageList: savedImages.failedImageList,
                logoUrl: savedImages.logoUrl || '',
            },
        }
    } catch (err) {
        throw err
    }
}

export async function saveScrapedImages(settings: Settings, imageFiles: ImageFiles[], logoUrl?: string) {
    console.log(`${!settings.saveMethod ? 'no save method' : 'save method = ' + settings.saveMethod}`)

    let save: (settings: Settings, imageFiles: ImageFiles[], logoUrl?: string) => Promise<SaveOutput>
    switch (settings.saveMethod) {
        case 'writeFolder':
            save = WriteToFile
            break

        case 's3Upload':
            save = s3FileUpload
            break
        case 'dudaUpload':
            save = batchUploadToDuda
            break

        case undefined:
            save = batchUploadToDuda
            break
        default:
            save = batchUploadToDuda
            break
    }

    const savedInfo = await save(settings, imageFiles, logoUrl)
    return {
        uploadedImages: savedInfo.uploadedImages || [],
        imageUploadCount: savedInfo.imageUploadCount || 0,
        failedImageList: savedInfo.failedImageList,
        logoUrl: savedInfo.logoUrl || '',
    }
}

export const savePageDataToS3 = async (settings: Settings, scrapedPageData: ScrapeSiteData) => {
    try {
        const folderPath = `${settings.basePath}/scraped/siteData`
        await addFileS3(scrapedPageData, folderPath)
        console.log('scraped page data uploaded to ', folderPath)
    } catch (err) {
        throw new ScrapingError({
            domain: settings.url,
            message: `Failed to save scraped site data: ` + err.message,
            state: { scrapeStatus: 'Scraped site data not saved', method: settings.saveMethod },
            errorType: 'SCR-012',
        })
    }
}
