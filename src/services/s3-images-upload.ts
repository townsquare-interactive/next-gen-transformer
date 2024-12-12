import type { ImageFiles } from '../../api/scrapers/asset-scrape.js'
import type { Settings } from '../controllers/scrape-controller.js'
import { addImageToS3 } from '../utilities/s3Functions.js'

export async function save(settings: Settings, imageFiles: ImageFiles[]) {
    try {
        let uploadedImages = 0
        for (let i = 0; i < imageFiles.length; i++) {
            const basePath = settings.basePath + '/scraped/images'
            console.log('uploading image to s3', imageFiles[i].imageFileName)
            //may have to change this to hash
            await addImageToS3(imageFiles[i].fileContents, `${basePath}/${imageFiles[i].imageFileName}`)
            uploadedImages += 1
        }

        return { uploadedImages: [], imageUploadCount: uploadedImages, failedImageList: [] }
    } catch (err) {
        throw 'Error saving to s3: ' + err.message
    }
}
