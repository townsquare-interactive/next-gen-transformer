import type { ImageFiles, ScrapeSiteData } from '../../api/scrapers/asset-scrape.js'
import { ScrapingError } from '../utilities/errors.js'
import { save as WriteToFile } from '../services/write-to-folder.js'
import { save as s3FileUpload } from '../services/s3-images-upload.js'
import { save as batchUploadToDuda } from '../services/save-to-duda.js'
import { addFileS3 } from '../utilities/s3Functions.js'
import type { Settings } from '../controllers/scrape-controller.js'
import { ScrapedAndAnalyzedSiteData, ScrapedAndAnalyzedSiteDataSchema } from '../schema/output-zod.js'
import { zodDataParse } from '../schema/utils-zod.js'

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
    siteData: ScrapedAndAnalyzedSiteData
}

export const save = async (settings: Settings, scrapedData: ScrapedDataToSave) => {
    if (settings.saveImages) {
        let s3SavedRes
        let siteDataFileUrl
        //save to s3 by default (backupImagesSave defaults to true if not in params)
        if (settings.backupImagesSave || settings.saveMethod === 's3Upload') {
            s3SavedRes = await saveScrapedData({ ...settings, saveMethod: 's3Upload' }, scrapedData.imageFiles, scrapedData.siteData)
            siteDataFileUrl = s3SavedRes?.siteDataUrl
        }

        let saveServiceRes
        if (settings.saveMethod != 's3Upload') {
            saveServiceRes = await saveScrapedData(settings, scrapedData.imageFiles, scrapedData.siteData, s3SavedRes?.imageData?.logoUrl || '')
        }

        const savedInfoResponse = saveServiceRes || s3SavedRes

        return {
            dataUploadDetails: {
                imageUploadTotal: savedInfoResponse?.imageData.imageUploadTotal || 0,
                failedImageCount: savedInfoResponse?.imageData.failedImageList.length || 0,
                uploadedResources: savedInfoResponse?.imageData.uploadedResources || [],
                s3UploadedImages: s3SavedRes?.imageData.uploadedResources || [],
                failedImages: savedInfoResponse?.imageData.failedImageList || [],
                siteDataFileUrl: siteDataFileUrl || '',
            },
            s3LogoUrl: s3SavedRes?.imageData?.logoUrl || '',
            scrapedPages: scrapedData.siteData.pages,
            url: scrapedData.url,
            siteData: scrapedData.siteData,
        }
    } else {
        return { message: 'Scrape complete: no images uploaded', scrapedPages: scrapedData.siteData.pages, url: scrapedData.url }
    }
}

export const saveScrapedData = async (settings: Settings, imageFiles: ImageFiles[], siteData: ScrapedAndAnalyzedSiteData, logoUrl?: string) => {
    try {
        const savedImages = await saveScrapedImages(settings, imageFiles, logoUrl)
        const websiteData: ScrapedAndAnalyzedSiteData = { ...siteData, s3LogoUrl: savedImages.logoUrl || '' }
        const validatedSiteData = zodDataParse(websiteData, ScrapedAndAnalyzedSiteDataSchema, 'scrapedOutput')
        let siteDataUrl
        if (settings.saveMethod === 's3Upload' && settings.analyzeHomepageData) {
            siteDataUrl = await saveSiteDataToS3(settings, validatedSiteData)
        }

        return {
            imageData: {
                uploadedResources: savedImages.uploadedImages,
                imageUploadTotal: savedImages.imageUploadCount,
                failedImageList: savedImages.failedImageList,
                logoUrl: savedImages.logoUrl || '',
            },
            siteDataUrl: siteDataUrl || '',
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
            save = s3FileUpload
            break
        default:
            save = s3FileUpload
            break
    }

    const savedInfo = await save(settings, imageFiles, logoUrl)
    return {
        uploadedImages: savedInfo.uploadedImages || [],
        imageUploadCount: savedInfo.imageUploadCount || 0,
        failedImageList: savedInfo.failedImageList || [],
        logoUrl: savedInfo.logoUrl || '',
    }
}

export const saveSiteDataToS3 = async (settings: Settings, scrapedPageData: ScrapedAndAnalyzedSiteData) => {
    try {
        const folderPath = `${settings.basePath}/scraped/siteData`
        const siteDataFileUrl = await addFileS3(scrapedPageData, folderPath)
        return siteDataFileUrl
    } catch (err) {
        throw new ScrapingError({
            domain: settings.url,
            message: `Failed to save scraped site data: ` + err.message,
            state: { scrapeStatus: 'Scraped site data not saved', method: settings.saveMethod },
            errorType: 'SCR-012',
        })
    }
}
