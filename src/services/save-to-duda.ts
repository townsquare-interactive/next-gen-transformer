import type { ImageFiles } from '../api/scrapers/asset-scrape.js'
import type { Settings } from './scrape-service.js'
import { preprocessImageUrl } from '../api/scrapers/utils.js'
import { ScrapingError } from '../utilities/errors.js'
import type { SaveOutput, SavingScrapedData } from '../output/save-scraped-data.js'
import { dudaImageFetch, uploadSiteSEOToDuda } from './duda-api.js'

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

export async function save(saveData: SavingScrapedData) {
    console.log('saving to duda')
    const settings = saveData.settings

    if (!settings.uploadLocation) {
        console.log('no upload location for Duda')
        throw new ScrapingError({
            domain: settings.url,
            message: 'Failed to upload to Duda, no uploadLocation found',
            state: { scrapeStatus: 'Data not uploaded', method: settings.saveMethod },
            errorType: 'SCR-012',
        })
    }

    const imageFiles = saveData.imageFiles
    const logoUrl = saveData.logoUrl
    const fetchFunction = saveData.functions?.imageUploadFunction
    const imageData = await saveImages(settings, imageFiles, saveData.imageList || [], logoUrl, fetchFunction)

    if (saveData.siteData?.siteSeo) {
        const seoUploadFunction = saveData.functions?.seoUploadFunction || uploadSiteSEOToDuda
        await seoUploadFunction(settings.uploadLocation, saveData.siteData.siteSeo)
    }

    return imageData
}

export async function saveImages(
    settings: Settings,
    imageFiles?: ImageFiles[],
    imageList?: string[],
    logoUrl?: string,
    fetchFunction?: (payload: UploadPayload[]) => DudaResponse
): Promise<SaveOutput> {
    const dudaFetchFunction = fetchFunction || dudaImageFetch

    let preprocessedPayload
    if (imageFiles && imageFiles.length > 0) {
        //use imageFiles from scraper
        preprocessedPayload = processImageUrlsForDuda(imageFiles, logoUrl)
    } else if (imageList && imageList.length > 0) {
        //use imageList from s3
        preprocessedPayload = processSringArrayForDuda(imageList, logoUrl)
    }

    if (preprocessedPayload) {
        // Slice preprocessed payload into batches of 10
        const batches = processBatch(preprocessedPayload, 10)
        const batchResults: DudaResponse[] = []

        for (const batch of batches) {
            try {
                const responseData = await dudaFetchFunction(batch, settings)
                batchResults.push(responseData)
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

        console.log('Batch upload results:', batchResults[0]?.uploaded_resources)
        console.log(`Total batches uploaded: ${batchResults.length}`)

        const allUploads: UploadedResourcesObj[] = []
        let succesfulImageCount = 0
        let failedImageList: string[] = []
        batchResults.forEach((result) => {
            result.uploaded_resources.forEach((batch) => {
                if (batch.status === 'UPLOADED') {
                    succesfulImageCount += 1
                }
                if (batch.status === 'NOT_FOUND') {
                    failedImageList.push(batch.original_url || '')
                }

                allUploads.push(batch)
            })
        })

        return { uploadedImages: allUploads, imageUploadCount: succesfulImageCount, failedImageList: failedImageList }
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
