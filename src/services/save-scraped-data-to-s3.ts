import type { ImageFiles } from '../api/scrapers/asset-scrape.js'
import { type Settings } from './scrape-service.js'
import { SavingScrapedData, siteDataUploadFunction } from '../output/save-scraped-data.js'
import { ScrapedAndAnalyzedSiteData, ScrapedAndAnalyzedSiteDataSchema } from '../schema/output-zod.js'
import { zodDataParse } from '../schema/utils-zod.js'
import { ScrapingError } from '../utilities/errors.js'
import { addFileS3, addImageToS3, deleteFolderS3 } from '../utilities/s3Functions.js'
import { UploadedResourcesObj } from './duda/save-images.js'
import { logoFileName, s3ScrapedSitesFolder, scrapeInfoDocName } from '../api/scrapers/constants.js'
import { createBusinessInfoDocument } from '../api/scrapers/utils.js'

export async function saveData(saveData: SavingScrapedData) {
    console.log('saving to s3')
    const fetchFunction = saveData.functions?.imageUploadFunction
    const siteDataUploadFunction = saveData.functions?.siteDataUploadFunction

    let imageData
    if (saveData.imageFiles && saveData.imageFiles.length >= 0) {
        imageData = await saveImages(saveData.settings, saveData.imageFiles, saveData.logoUrl, fetchFunction)
    }

    let siteDataUrl
    let siteData
    if (saveData.siteData) {
        //modify siteData based off S3 saved data
        siteData = {
            ...saveData.siteData,
            assetData: {
                s3UploadedImages: imageData?.uploadedImages.map((img) => {
                    return {
                        src: img.src,
                        pageTitle: img.pageTitle,
                    }
                }),
                s3LogoUrl: imageData?.logoUrl || '',
                s3MediaFiles: imageData?.mediaFiles.map((img) => {
                    return {
                        src: img.src,
                        pageTitle: img.pageTitle,
                    }
                }),
            },
        }

        const websiteData: ScrapedAndAnalyzedSiteData = siteData
        const validatedSiteData = zodDataParse(websiteData, ScrapedAndAnalyzedSiteDataSchema, 'scrapedOutput')
        siteDataUrl = await saveSiteDataToS3(saveData.settings, validatedSiteData, siteDataUploadFunction)

        //create business info document
        const businessDoc = createBusinessInfoDocument(validatedSiteData)
        siteDataUrl = await saveBusinessInfoDocument(saveData.settings, businessDoc, siteDataUploadFunction)
    }

    return { ...imageData, siteDataUrl, siteData }
}

export const saveSiteDataToS3 = async (settings: Settings, scrapedPageData: ScrapedAndAnalyzedSiteData, siteDataUploadFunction?: siteDataUploadFunction) => {
    try {
        const uploadFunction = siteDataUploadFunction || addFileS3
        const folderPath = `${s3ScrapedSitesFolder}${settings.basePath}/scraped/siteData`
        const siteDataUrl = await uploadFunction(scrapedPageData, folderPath)
        return siteDataUrl
    } catch (err) {
        throw new ScrapingError({
            domain: settings.url,
            message: `Failed to save scraped site data: ` + err.message,
            state: { scrapeStatus: 'Scraped site data not saved', method: settings.saveMethod },
            errorType: 'SCR-012',
        })
    }
}

export const saveBusinessInfoDocument = async (settings: Settings, businessDoc: any, siteDataUploadFunction?: siteDataUploadFunction) => {
    try {
        const uploadFunction = siteDataUploadFunction || addFileS3
        const folderPath = `${s3ScrapedSitesFolder}${settings.basePath}/scraped/${scrapeInfoDocName}`
        const businessDocUrl = await uploadFunction(businessDoc, folderPath, 'txt')
        return businessDocUrl
    } catch (err) {
        throw new ScrapingError({
            domain: settings.url,
            message: `Failed to save scraped site data: ` + err.message,
            state: { scrapeStatus: 'Scraped site data not saved', method: settings.saveMethod },
            errorType: 'SCR-012',
        })
    }
}

export async function saveImages(settings: Settings, imageFiles: ImageFiles[], logoUrl?: string, fetchFunction?: (payload: string[]) => string) {
    try {
        let uploadedImagesCount = 0
        const imageList: UploadedResourcesObj[] = []
        const mediaFiles: UploadedResourcesObj[] = []
        console.log('imagefiles length', imageFiles.length)
        const uploadImage = fetchFunction || addImageToS3
        const baseS3FolderName = `${s3ScrapedSitesFolder}${settings.basePath}`
        let s3LogoUrl = ''

        //remove scraped images folder if it exists
        try {
            const scrapedImagesFolder = `${baseS3FolderName}/scraped/images`
            const deleteStatus = await deleteFolderS3(scrapedImagesFolder)
            console.log('deleteStatus', deleteStatus)
        } catch (err) {
            console.log('unable to delete scraped images folder', err)
        }

        for (let i = 0; i < imageFiles.length; i++) {
            const basePath = imageFiles[i].type === 'logo' ? baseS3FolderName + '/scraped/images/logos' : baseS3FolderName + '/scraped/images'
            let fileName = `${basePath}/${imageFiles[i].imageFileName}`

            if (imageFiles[i].type === 'logo') {
                console.log('we have a logo img', imageFiles[i].imageFileName)
                fileName = `${basePath}/${logoFileName}${imageFiles[i].fileExtension}` //need to add file ext
            }

            const s3Url = await uploadImage(imageFiles[i].fileContents, fileName)
            if (imageFiles[i].type === 'logo') {
                s3LogoUrl = s3Url
                console.log('s3url', s3Url)
            }
            if (imageFiles[i].type === 'video' || imageFiles[i].type === 'audio') {
                mediaFiles.push({ src: s3Url, status: 'UPLOADED', pageTitle: imageFiles[i].pageTitle })
            } else {
                imageList.push({ src: s3Url, status: 'UPLOADED', pageTitle: imageFiles[i].pageTitle })
                uploadedImagesCount += 1
            }
        }

        return { uploadedImages: imageList, imageUploadCount: uploadedImagesCount, failedImageList: [], logoUrl: s3LogoUrl, mediaFiles: mediaFiles }
    } catch (err) {
        throw new ScrapingError({
            domain: settings.url,
            message: `Failed to save scraped images to S3: ` + err,
            state: { scrapeStatus: 'Scraped images not saved' },
            errorType: 'SCR-012',
        })
    }
}
