import { Settings } from '../../api/scrapers/image-scrape.js'
import { convertUrlToApexId } from '../utilities/utils.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

export async function save(settings: Settings, imageFiles: { hashedFileName: string; fileContents: string }[]) {
    try {
        const __filename = fileURLToPath(import.meta.url)
        const __dirname = path.dirname(__filename)

        for (let i = 0; i < imageFiles.length; i++) {
            const dirName = convertUrlToApexId(settings.url)
            const storagePath = path.resolve(__dirname, 'scraped-images', dirName)
            fs.mkdirSync(storagePath, { recursive: true })
            const filePath = path.resolve(storagePath, imageFiles[i].hashedFileName)
            const writeStream = fs.createWriteStream(filePath)
            writeStream.write(imageFiles[i].fileContents)
        }
    } catch (err) {
        throw 'Error saving to file system: ' + err.message
    }
}
