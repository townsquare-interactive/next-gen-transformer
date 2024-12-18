import type { ImageFiles, ScrapeSiteData } from '../../api/scrapers/asset-scrape.js'
import { ScrapingError } from '../utilities/errors.js'
import { save as WriteToFile } from '../services/write-to-folder.js'
import { save as s3FileUpload } from '../services/s3-images-upload.js'
import { save as batchUploadToDuda } from '../services/save-to-duda.js'
import { addFileS3 } from '../utilities/s3Functions.js'
import type { Settings } from '../controllers/scrape-controller.js'

export interface SaveOutput {
    uploadedImages: any[]
    imageUploadCount: number
    failedImageList: string[]
}

export const saveScrapedData = async (settings: Settings, imageFiles: ImageFiles[], siteData: ScrapeSiteData) => {
    try {
        console.log(`attempting to save images to ${settings.saveMethod}`)
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
        throw new ScrapingError({
            domain: settings.url,
            message: `Failed to save scraped data: ` + err.message,
            state: { scrapeStatus: 'Scraped images not saved' },
            errorType: 'SCR-012',
        })
    }
}

export async function saveScrapedImages(settings: Settings, imageFiles: ImageFiles[]) {
    try {
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
    } catch (err) {
        throw new ScrapingError({
            domain: settings.url,
            message: `Failed to save scraped images: ` + err.message,
            state: { scrapeStatus: 'Scraped images not saved' },
            errorType: 'SCR-012',
        })
    }
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
