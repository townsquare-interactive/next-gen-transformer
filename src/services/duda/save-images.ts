import type { ImageFiles } from '../../api/scrapers/asset-scrape.js'
import type { Settings } from '../scrape-service.js'
import { preprocessImageUrl } from '../../api/scrapers/utils.js'
import { ScrapingError } from '../../utilities/errors.js'
import type { SaveOutput } from '../../output/save-scraped-data.js'
import { dudaImageFetch } from '../duda-api.js'
import { logoFileName } from '../save-scraped-data-to-s3.js'

export interface UploadPayload {
    resource_type: 'IMAGE'
    src: string
    folder: string
}

export interface UploadedResourcesObj {
    id?: string
    src: string
    original_url?: string
    new_url?: string
    status?: 'UPLOADED' | 'NOT_FOUND'
}

export interface DudaResponse {
    success: boolean
    message?: string
    uploaded_resources: UploadedResourcesObj[]
}

export async function saveImages(
    settings: Settings,
    imageFiles?: ImageFiles[],
    imageList?: string[],
    logoUrl?: string,
    fetchFunction?: (payload: UploadPayload[]) => Promise<DudaResponse>
): Promise<SaveOutput> {
    const dudaFetchFunction = fetchFunction || dudaImageFetch
    const BATCH_DELAY = 2000 // 2 second delay
    const BATCHES_BEFORE_DELAY = 3 // Number of batches to process before delay

    let preprocessedPayload
    if (imageFiles && imageFiles.length > 0) {
        //use imageFiles from scraper
        preprocessedPayload = processImageUrlsForDuda(imageFiles, logoUrl)
    } else if (imageList && imageList.length > 0) {
        //use imageList from s3
        preprocessedPayload = processSringArrayForDuda(imageList, logoUrl)
    }

    const originalLogoUrl = findLogoFile(imageList, imageFiles, logoFileName)

    if (preprocessedPayload) {
        // Slice preprocessed payload into batches of 10
        const batches = processBatch(preprocessedPayload, 10)
        const batchResults: DudaResponse[] = []
        console.log('batches length', batches.length)

        for (let i = 0; i < batches.length; i++) {
            try {
                const responseData = await dudaFetchFunction(batches[i], settings)
                batchResults.push(responseData)

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

export function processImageUrlsForDuda(imageFiles: ImageFiles[], logoUrl?: string): UploadPayload[] {
    const seenUrls = new Set<string>()
    const processedUrls: UploadPayload[] = []
    const dudaImageFolder = 'Imported'

    imageFiles.forEach((file) => {
        const processedUrl = preprocessImageUrl(file.url)

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
            folder: dudaImageFolder,
        })
    })

    return processedUrls
}

export function processSringArrayForDuda(imageFiles: string[], logoUrl?: string): UploadPayload[] {
    const seenUrls = new Set<string>()
    const processedUrls: UploadPayload[] = []
    const dudaImageFolder = 'Imported'

    imageFiles.forEach((file) => {
        if (!file) {
            console.warn(`Invalid URL skipped: ${file}`)
            return
        }

        if (seenUrls.has(file)) {
            console.warn(`Duplicate URL skipped: ${file}`)
            return
        }

        seenUrls.add(file)
        processedUrls.push({
            resource_type: 'IMAGE',
            src: file,
            folder: dudaImageFolder,
        })
    })

    //add logo src seperately from s3 url
    if (logoUrl) {
        processedUrls.push({
            resource_type: 'IMAGE',
            src: logoUrl,
            //folder: 'logos',
            folder: dudaImageFolder,
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

const findLogoFile = (imageList: string[] | undefined, imageFiles: ImageFiles[] | undefined, logoFileName: string) => {
    if (imageList && imageList.length > 0) {
        return imageList.find((url) => url.includes(logoFileName))
    }

    if (imageFiles && imageFiles.length > 0) {
        const logoFile = imageFiles.find((file) => file.type === 'logo')
        return logoFile?.imageFileName
    }

    return undefined
}
