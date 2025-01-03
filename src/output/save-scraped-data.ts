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
        if (settings.backupImagesSave) {
            s3SavedRes = await saveScrapedData({ ...settings, saveMethod: 's3Upload' }, scrapedData.imageFiles, scrapedData.siteData)
        }

        const saveServiceRes = await saveScrapedData(settings, scrapedData.imageFiles, scrapedData.siteData)
        const savedInfoResponse = saveServiceRes || s3SavedRes

        return {
            imageUploadTotal: savedInfoResponse?.imageData.imageUploadTotal,
            failedImageCount: savedInfoResponse.imageData.failedImageList.length,
            uploadedResources: savedInfoResponse.imageData.uploadedResources,
            s3UploadedImages: s3SavedRes?.imageData.uploadedResources || [],
            failedImages: savedInfoResponse.imageData.failedImageList,
            scrapedPages: scrapedData.siteData.pages,
            url: scrapedData.url,
            siteData: scrapedData.siteData,
        }
    } else {
        return { message: 'Scrape complete: no images uploaded', scrapedPages: scrapedData.siteData.pages, url: scrapedData.url }
    }
}

export const saveScrapedData = async (settings: Settings, imageFiles: ImageFiles[], siteData: ScrapeSiteData) => {
    try {
        const savedImages = await saveScrapedImages(settings, imageFiles)
        await savePageDataToS3(settings, siteData)

        return {
            imageData: {
                uploadedResources: savedImages.uploadedImages,
                imageUploadTotal: savedImages.imageUploadCount,
                failedImageList: savedImages.failedImageList,
            },
        }
    } catch (err) {
        /*         throw new ScrapingError({
            domain: settings.url,
            message: `Failed to save scraped data: ` + err.message,
            state: { scrapeStatus: 'Scraped images not saved' },
            errorType: 'SCR-012',
        }) */
        throw err
    }
}

export async function saveScrapedImages(settings: Settings, imageFiles: ImageFiles[]) {
    // try {
    console.log(`${!settings.saveMethod ? 'no save method' : 'save method = ' + settings.saveMethod}`)

    let save: (settings: Settings, imageFiles: ImageFiles[]) => Promise<SaveOutput>
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

    const savedInfo = await save(settings, imageFiles)
    return {
        uploadedImages: savedInfo.uploadedImages || [],
        imageUploadCount: savedInfo.imageUploadCount || 0,
        failedImageList: savedInfo.failedImageList,
    }
    /*  } catch (err) {
        throw new ScrapingError({
            domain: settings.url,
            message: `Failed to save scraped images: ` + err.message,
            state: { scrapeStatus: 'Scraped images not saved' },
            errorType: 'SCR-012',
        })
    } */
}

export const savePageDataToS3 = async (settings: Settings, scrapedPageData: ScrapeSiteData) => {
    try {
        const folderPath = `${settings.basePath}/scraped/siteData`
        await addFileS3(scrapedPageData, folderPath)
        console.log('scraped page data uploaded to ', folderPath)
    } catch (err) {
        throw err.message
    }
}
