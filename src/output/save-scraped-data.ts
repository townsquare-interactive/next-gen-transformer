import type { ImageFiles } from '../api/scrapers/asset-scrape.js'
import { saveData as s3FileUpload } from '../services/save-scraped-data-to-s3.js'
import { UploadedResourcesObj, save as dudaUpload } from '../services/save-to-duda.js'
import type { Settings } from '../services/scrape-service.js'
import { ScrapedAndAnalyzedSiteData, ScrapedPageSeo } from '../schema/output-zod.js'

export interface SaveOutput {
    uploadedImages?: UploadedResourcesObj[]
    imageUploadCount?: number
    failedImageList?: string[]
    logoUrl?: string
    siteDataUrl?: string
    siteData?: ScrapedAndAnalyzedSiteData
}

export interface ScrapedDataToSave {
    imageNames: never[]
    url: string
    imageFiles?: ImageFiles[]
    imageList?: string[]
    siteData: ScrapedAndAnalyzedSiteData
}

export type siteDataUploadFunction = (siteData: ScrapedAndAnalyzedSiteData, key: string) => string

export type utilityFunctions = {
    imageUploadFunction?: (payload: any) => any
    siteDataUploadFunction?: siteDataUploadFunction
    seoUploadFunction?: (siteId: string, seoData: ScrapedPageSeo) => Promise<void>
}

export interface SavingScrapedData {
    settings: Settings
    imageFiles?: ImageFiles[]
    imageList?: string[]
    siteData?: ScrapedAndAnalyzedSiteData
    logoUrl?: string
    functions?: utilityFunctions
}

export const save = async (settings: Settings, scrapedData: ScrapedDataToSave, functions?: utilityFunctions) => {
    if (settings.saveImages) {
        let s3SavedRes
        let siteDataUrl

        //save/backup data to s3 by default
        if (settings.backupImagesSave || settings.saveMethod === 's3Upload') {
            s3SavedRes = await saveToService(
                { ...settings, saveMethod: 's3Upload' },
                scrapedData.siteData,
                scrapedData.imageFiles,
                scrapedData.imageList,
                '',
                functions
            )
            siteDataUrl = s3SavedRes?.siteDataUrl
        }

        //save to alternative service
        let saveServiceRes
        if (settings.saveMethod != 's3Upload') {
            saveServiceRes = await saveToService(
                settings,
                scrapedData.siteData,
                scrapedData.imageFiles,
                scrapedData.imageList,
                //s3SavedRes?.imageData?.logoUrl || '',
                '',
                functions
            )
        }

        const savedInfoResponse = saveServiceRes || s3SavedRes

        return {
            dataUploadDetails: {
                imageUploadTotal: savedInfoResponse?.imageData.imageUploadTotal || 0,
                failedImageCount: savedInfoResponse?.imageData.failedImageList?.length || 0,
                uploadedResources: savedInfoResponse?.imageData.uploadedResources || [],
                s3UploadedImages: s3SavedRes?.siteData.assetData?.s3UploadedImages || [],
                failedImages: savedInfoResponse?.imageData.failedImageList || [],
                siteDataUrl: siteDataUrl || '',
            },
            s3LogoUrl: s3SavedRes?.imageData?.logoUrl || '',
            url: scrapedData.url,
            siteData: s3SavedRes?.siteData || scrapedData.siteData,
        }
    } else {
        return { message: 'Scrape complete: no images uploaded', scrapedPages: scrapedData.siteData.pages, url: scrapedData.url }
    }
}

export async function saveToService(
    settings: Settings,
    siteData: ScrapedAndAnalyzedSiteData,
    imageFiles?: ImageFiles[],
    imageList?: string[],
    logoUrl?: string,
    functions?: utilityFunctions
) {
    try {
        console.log(`${!settings.saveMethod ? 'no save method' : 'save method = ' + settings.saveMethod}`)

        let save: (saveData: SavingScrapedData) => Promise<SaveOutput>
        switch (settings.saveMethod) {
            case 's3Upload':
                save = s3FileUpload
                break
            case 'dudaUpload':
                save = dudaUpload
                break
            case undefined:
                save = s3FileUpload
                break
            default:
                save = s3FileUpload
                break
        }

        const savedData = await save({ settings, imageFiles, imageList, siteData, logoUrl, functions })

        return {
            imageData: {
                uploadedResources: savedData.uploadedImages,
                imageUploadTotal: savedData.imageUploadCount,
                failedImageList: savedData.failedImageList,
                logoUrl: savedData.logoUrl || '',
            },
            siteDataUrl: savedData.siteDataUrl || '',
            siteData: savedData.siteData || siteData,
        }
    } catch (err) {
        throw err
    }
}
