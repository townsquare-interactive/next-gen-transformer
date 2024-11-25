import { Settings } from '../../api/scrapers/image-scrape.js'
import { ScrapingError } from '../utilities/errors.js'
import { addImageToS3 } from '../utilities/s3Functions.js'
import { convertUrlToApexId } from '../utilities/utils.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

export async function saveScrapedImages(settings: Settings, imageFiles: { hashedFileName: string; fileContents: string }[]) {
    try {
        const __filename = fileURLToPath(import.meta.url)
        const __dirname = path.dirname(__filename)
        for (let i = 0; i < imageFiles.length; i++) {
            // Write the file to the local folder if specified
            if (settings.method === 'writeFolder') {
                const dirName = convertUrlToApexId(settings.url)
                const storagePath = path.resolve(__dirname, 'scraped-images', dirName)
                fs.mkdirSync(storagePath, { recursive: true })
                const filePath = path.resolve(storagePath, imageFiles[i].hashedFileName)
                const writeStream = fs.createWriteStream(filePath)
                writeStream.write(imageFiles[i].fileContents)
            }

            // Upload the image to S3 if specified
            if (settings.method === 's3Upload') {
                const basePath = convertUrlToApexId(settings.url) + '/scraped'
                console.log('uploading image to s3', imageFiles[i].hashedFileName)
                await addImageToS3(imageFiles[i].fileContents, `${basePath}/${imageFiles[i].hashedFileName}`)
            }
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
