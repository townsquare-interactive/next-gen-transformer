import type { ImageFiles } from '../../api/scrapers/asset-scrape.js'
import type { Settings } from '../scrape-service.js'
import { preprocessImageUrl } from '../../api/scrapers/utils.js'
import { ScrapingError } from '../../utilities/errors.js'
import type { SaveOutput } from '../../output/save-scraped-data.js'
import { dudaImageUpload } from '../duda-api.js'
import { logoFileName } from '../../api/scrapers/constants.js'
import { S3UploadedImageList } from '../../schema/output-zod.js'
import { UploadResourceResponse } from '@dudadev/partner-api/dist/types/lib/content/types.js'

export interface UploadPayload {
    resource_type: 'IMAGE'
    src: string
    folder: string
}

export interface UploadedResourcesObj {
    id?: string
    src?: string
    original_url?: string
    new_url?: string
    status?: string
    pageTitle?: string
    n_failures?: number
    uploaded_resources?: UploadResourceResponse['uploaded_resources']
}

export async function saveImages(
    settings: Settings,
    imageFiles?: ImageFiles[],
    imageList?: S3UploadedImageList[],
    logoUrl?: string,
    fetchFunction?: (payload: UploadPayload[]) => Promise<UploadResourceResponse>
): Promise<SaveOutput> {
    const dudaFetchFunction = fetchFunction || dudaImageUpload
    const BATCH_DELAY = 2000 // 2 second delay
    const BATCHES_BEFORE_DELAY = 3 // Number of batches to process before delay

    let preprocessedPayload
    const usingS3Images = (!imageFiles || imageFiles.length <= 0) && imageList && imageList.length > 0

    if ((imageFiles && imageFiles.length > 0) || (imageList && imageList.length > 0)) {
        const imageFilesToProcess = imageFiles && imageFiles.length > 0 ? imageFiles : imageList

        preprocessedPayload = processImageUrlsForDuda(imageFilesToProcess, usingS3Images ? logoUrl : undefined)
    }

    const originalLogoUrl = findLogoFile(imageList, imageFiles, logoFileName)

    if (preprocessedPayload) {
        // Slice preprocessed payload into batches of 10
        const batches = processBatch(preprocessedPayload, 10)
        const batchResults: UploadResourceResponse[] = []
        console.log('batches length', batches.length)

        for (let i = 0; i < batches.length; i++) {
            try {
                const responseData = await dudaFetchFunction(batches[i], settings.uploadLocation || '')
                if (responseData) {
                    batchResults.push(responseData)
                }

                // Add delay after every 3 batches (but not after the last batch)
                if ((i + 1) % BATCHES_BEFORE_DELAY === 0 && i < batches.length - 1) {
                    console.log(`Processed ${i + 1} batches, pausing for ${BATCH_DELAY}ms...`)
                    await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY))
                }
            } catch (error) {
                console.error(`Error uploading batch: ${error}`)
                throw new ScrapingError({
                    domain: settings.url,
                    message: 'Failed to upload batch images: ' + error,
                    state: { scrapeStatus: 'Images not uploaded', method: settings.saveMethod },
                    errorType: 'SCR-012',
                })
            }
        }

        console.log(`Total batches uploaded: ${batchResults.length}`)
        let dudaLogoUrl

        const allUploads: UploadedResourcesObj[] = []
        let succesfulImageCount = 0
        const failedImageList: string[] = []
        batchResults.forEach((result) => {
            result.uploaded_resources.forEach((batch) => {
                if (batch.status === 'UPLOADED') {
                    succesfulImageCount += 1
                }
                if (batch.status === 'NOT_FOUND') {
                    failedImageList.push(batch.original_url || '')
                }

                //find duda logoUrl for business info
                if (originalLogoUrl && batch.original_url?.includes(originalLogoUrl)) {
                    dudaLogoUrl = batch.new_url
                }

                allUploads.push(batch)
            })
        })

        return { uploadedImages: allUploads, imageUploadCount: succesfulImageCount, failedImageList: failedImageList, dudaLogoUrl }
    } else {
        return { uploadedImages: [], imageUploadCount: 0, failedImageList: [] }
    }
}

export function processImageUrlsForDuda(imageFiles?: ImageFiles[] | S3UploadedImageList[], logoUrl?: string): UploadPayload[] {
    if (!imageFiles) {
        return []
    }

    const seenUrls = new Set<string>()
    const processedUrls: UploadPayload[] = []
    const dudaImageFolder = 'Imported'

    imageFiles.forEach((file) => {
        if (file.type && (file.type === 'video' || file.type === 'audio')) {
            return
        }

        //handle src files from S3
        if (file.src) {
            if (seenUrls.has(file.src)) {
                console.warn(`Duplicate URL skipped: ${file.src}`)
                return
            }

            seenUrls.add(file.src)
            processedUrls.push({
                resource_type: 'IMAGE',
                src: file.src,
                folder: file.pageTitle || dudaImageFolder,
            })
        } //handle URLs coming from websites
        else if (typeof file === 'object' && 'url' in file) {
            const processedUrl = preprocessImageUrl(file.url as URL)

            if (!processedUrl) {
                console.warn(`Invalid URL skipped: ${file.url}`)
                return
            }

            if (seenUrls.has(processedUrl)) {
                console.warn(`Duplicate URL skipped: ${processedUrl}`)
                return
            }
            seenUrls.add(processedUrl)
            processedUrls.push({
                resource_type: 'IMAGE',
                src: processedUrl,
                folder: file.pageTitle || dudaImageFolder,
            })
        }
    })

    if (logoUrl && !seenUrls.has(logoUrl)) {
        console.log('logoUrl', logoUrl)
        console.log('seenUrls', seenUrls)
        processedUrls.push({
            resource_type: 'IMAGE',
            src: logoUrl,
            folder: 'Home',
        })
    }

    return processedUrls
}

export function processBatch(payload: UploadPayload[], batchSize: number): UploadPayload[][] {
    const batches: UploadPayload[][] = []
    for (let i = 0; i < payload.length; i += batchSize) {
        batches.push(payload.slice(i, i + batchSize))
    }
    return batches
}

const findLogoFile = (imageList: S3UploadedImageList[] | undefined, imageFiles: ImageFiles[] | undefined, logoFileName: string) => {
    if (imageList && imageList.length > 0) {
        return imageList.find((url) => url.src?.includes(logoFileName))?.src
    }

    if (imageFiles && imageFiles.length > 0) {
        const logoFile = imageFiles.find((file) => file.type === 'logo')
        return logoFile?.imageFileName
    }

    return undefined
}
