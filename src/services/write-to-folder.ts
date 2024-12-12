import type { Settings } from '../../src/controllers/scrape-controller.js'
import { convertUrlToApexId } from '../utilities/utils.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

export async function save(settings: Settings, imageFiles: { imageFileName: string; fileContents: string }[]) {
    try {
        const __filename = fileURLToPath(import.meta.url)
        const __dirname = path.dirname(__filename)

        let uploadcount = 0
        for (let i = 0; i < imageFiles.length; i++) {
            const dirName = convertUrlToApexId(settings.url)
            const storagePath = path.resolve(__dirname, 'scraped-images', dirName)
            fs.mkdirSync(storagePath, { recursive: true })
            const filePath = path.resolve(storagePath, imageFiles[i].imageFileName)
            const writeStream = fs.createWriteStream(filePath)
            writeStream.write(imageFiles[i].fileContents)
            uploadcount += 0
        }

        return { uploadedImages: [], imageUploadCount: uploadcount, failedImageList: [] }
    } catch (err) {
        throw 'Error saving to file system: ' + err.message
    }
}
