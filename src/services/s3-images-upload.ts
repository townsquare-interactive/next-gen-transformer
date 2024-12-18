import type { ImageFiles } from '../../api/scrapers/asset-scrape.js'
import type { Settings } from '../controllers/scrape-controller.js'
import { addImageToS3 } from '../utilities/s3Functions.js'
import { createRandomFiveCharString } from '../utilities/utils.js'

export async function save(settings: Settings, imageFiles: ImageFiles[]) {
    try {
        let uploadedImagesCount = 0
        let imageList = []
        console.log('imagefiles length', imageFiles.length)

        for (let i = 0; i < imageFiles.length; i++) {
            const basePath = settings.basePath + '/scraped/images'
            console.log('uploading image to s3', imageFiles[i].imageFileName)

            //may have to change this to hash
            const s3Url = await addImageToS3(imageFiles[i].fileContents, `${basePath}/${imageFiles[i].imageFileName}`)
            console.log('s3url', s3Url)
            imageList.push({ fileName: s3Url, status: 'uploaded' })
            uploadedImagesCount += 1
        }

        return { uploadedImages: imageList, imageUploadCount: uploadedImagesCount, failedImageList: [] }
    } catch (err) {
        throw 'Error saving to s3: ' + err.message
    }
}
