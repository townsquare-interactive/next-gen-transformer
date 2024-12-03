import type { ImageFiles, Settings } from '../../api/scrapers/image-scrape.js'
import { ScrapingError } from '../utilities/errors.js'
import { save as WriteToFile } from '../services/write-to-folder.js'
import { save as s3FileUpload } from '../services/s3-upload.js'
import { save as batchUploadToDuda } from '../services/save-to-duda.js'

export async function saveScrapedImages(settings: Settings, imageFiles: ImageFiles[]) {
    try {
        console.log(`${!settings.saveMethod ? 'no save method' : 'save method = ' + settings.saveMethod}`)

        let save
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

        await save(settings, imageFiles)
    } catch (err) {
        throw new ScrapingError({
            domain: settings.url,
            message: `Failed to save scraped images: ` + err.message,
            state: { scrapeStatus: 'Scraped images not saved' },
            errorType: 'SCR-012',
        })
    }
}
