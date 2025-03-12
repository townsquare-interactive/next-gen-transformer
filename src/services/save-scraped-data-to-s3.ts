import type { ImageFiles } from '../../api/scrapers/asset-scrape.js'
import { type Settings } from '../controllers/scrape-controller.js'
import { SavingScrapedData, siteDataUploadFunction } from '../output/save-scraped-data.js'
import { ScrapedAndAnalyzedSiteData, ScrapedAndAnalyzedSiteDataSchema } from '../schema/output-zod.js'
import { zodDataParse } from '../schema/utils-zod.js'
import { ScrapingError } from '../utilities/errors.js'
import { addFileS3, addImageToS3 } from '../utilities/s3Functions.js'
import { UploadedResourcesObj } from './save-to-duda.js'

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
    if (saveData.siteData && saveData.settings.analyzeHomepageData) {
        //modify siteData based off S3 saved data
        siteData = {
            ...saveData.siteData,
            assetData: {
                s3UploadedImages: imageData?.uploadedImages.map((img) => img.src),
                s3LogoUrl: imageData?.logoUrl || '',
            },
        }

        const websiteData: ScrapedAndAnalyzedSiteData = siteData
        const validatedSiteData = zodDataParse(websiteData, ScrapedAndAnalyzedSiteDataSchema, 'scrapedOutput')
        siteDataUrl = await saveSiteDataToS3(saveData.settings, validatedSiteData, siteDataUploadFunction)
    }

    return { ...imageData, siteDataUrl, siteData }
}

export const saveSiteDataToS3 = async (settings: Settings, scrapedPageData: ScrapedAndAnalyzedSiteData, siteDataUploadFunction?: siteDataUploadFunction) => {
    try {
        const uploadFunction = siteDataUploadFunction || addFileS3
        const folderPath = `${settings.basePath}/scraped/siteData`
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

export async function saveImages(settings: Settings, imageFiles: ImageFiles[], logoUrl?: string, fetchFunction?: (payload: string[]) => string) {
    try {
        let uploadedImagesCount = 0
        let imageList: UploadedResourcesObj[] = []
        console.log('imagefiles length', imageFiles.length)
        const uploadImage = fetchFunction || addImageToS3

        let s3LogoUrl = ''
        for (let i = 0; i < imageFiles.length; i++) {
            const basePath = imageFiles[i].type === 'logo' ? settings.basePath + '/scraped/images/logos' : settings.basePath + '/scraped/images'
            let fileName = `${basePath}/${imageFiles[i].imageFileName}`

            if (imageFiles[i].type === 'logo') {
                console.log('we have a logo img', imageFiles[i].imageFileName)
                fileName = `${basePath}/header-logo${imageFiles[i].fileExtension}` //need to add file ext
            }

            //may have to change this to hash
            const s3Url = await uploadImage(imageFiles[i].fileContents, fileName)
            if (imageFiles[i].type === 'logo') {
                s3LogoUrl = s3Url
                console.log('s3url', s3Url)
            }
            imageList.push({ src: s3Url, status: 'UPLOADED' })
            uploadedImagesCount += 1
        }

        return { uploadedImages: imageList, imageUploadCount: uploadedImagesCount, failedImageList: [], logoUrl: s3LogoUrl }
    } catch (err) {
        throw new ScrapingError({
            domain: settings.url,
            message: `Failed to save scraped images to S3: ` + err,
            state: { scrapeStatus: 'Scraped images not saved' },
            errorType: 'SCR-012',
        })
    }
}
