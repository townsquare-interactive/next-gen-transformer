import type { ImageFiles } from '../../api/scrapers/asset-scrape.js'
import type { Settings } from '../controllers/scrape-controller.js'
import { ScrapingError } from '../utilities/errors.js'
import { addImageToS3 } from '../utilities/s3Functions.js'

export async function save(settings: Settings, imageFiles: ImageFiles[], logoUrl?: string) {
    try {
        let uploadedImagesCount = 0
        let imageList = []
        console.log('imagefiles length', imageFiles.length)

        let s3LogoUrl = ''
        for (let i = 0; i < imageFiles.length; i++) {
            const basePath = imageFiles[i].type === 'logo' ? settings.basePath + '/scraped/images/logos' : settings.basePath + '/scraped/images'
            let fileName = `${basePath}/${imageFiles[i].imageFileName}`

            if (imageFiles[i].type === 'logo') {
                console.log('we have a logo img', imageFiles[i].imageFileName)
                fileName = `${basePath}/header-logo${imageFiles[i].fileExtension}` //need to add ext
            }

            //may have to change this to hash
            const s3Url = await addImageToS3(imageFiles[i].fileContents, fileName)
            if (imageFiles[i].type === 'logo') {
                s3LogoUrl = s3Url
                console.log('s3url', s3Url)
            }
            imageList.push({ fileName: s3Url, status: 'uploaded' })
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
