import type { ImageFiles, Settings } from '../../api/scrapers/image-scrape.js'
import { ScrapingError } from '../utilities/errors.js'
import { addImageToS3 } from '../utilities/s3Functions.js'
import { convertUrlToApexId } from '../utilities/utils.js'

export async function save(settings: Settings, imageFiles: ImageFiles[]) {
    try {
        for (let i = 0; i < imageFiles.length; i++) {
            const basePath = convertUrlToApexId(settings.url) + '/scraped'
            console.log('uploading image to s3', imageFiles[i].hashedFileName)
            await addImageToS3(imageFiles[i].fileContents, `${basePath}/${imageFiles[i].hashedFileName}`)
        }
    } catch (err) {
        throw 'Error saving to s3: ' + err.message
    }
}
