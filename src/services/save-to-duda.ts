import type { ImageFiles } from '../../api/scrapers/asset-scrape.js'
import type { Settings } from '../../src/controllers/scrape-controller.js'
import { preprocessImageUrl } from '../../api/scrapers/utils.js'
import { ScrapingError } from '../utilities/errors.js'
import type { SaveOutput } from '../output/save-scraped-data.js'

interface UploadPayload {
    resource_type: 'IMAGE'
    src: string
    folder: string
}

export interface UploadedResourcesObj {
    id: string
    src: string
    original_url: string
    new_url?: string
    status?: 'UPLOADED' | 'NOT_FOUND'
}

interface DudaResponse {
    success: boolean
    message?: string
    uploaded_resources: UploadedResourcesObj[]
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

export function processBatch(payload: UploadPayload[], batchSize: number): UploadPayload[][] {
    const batches: UploadPayload[][] = []
    for (let i = 0; i < payload.length; i += batchSize) {
        batches.push(payload.slice(i, i + batchSize))
    }
    return batches
}

export async function save(
    settings: Settings,
    imageFiles: ImageFiles[],
    logoUrl?: string,
    fetchFunction?: (payload: UploadPayload[]) => DudaResponse
): Promise<SaveOutput> {
    if (!settings.uploadLocation) {
        console.log('no upload location for Duda')
        throw new ScrapingError({
            domain: settings.url,
            message: 'Failed to upload images to Duda, no uploadLocation found',
            state: { scrapeStatus: 'Images not uploaded', method: settings.saveMethod },
            errorType: 'SCR-012',
        })
    }

    const dudaFetchFunction = fetchFunction || dudaFetch
    const preprocessedPayload = processImageUrlsForDuda(imageFiles, logoUrl)

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
                failedImageList.push(batch.original_url)
            }

            allUploads.push(batch)
        })
    })

    return { uploadedImages: allUploads, imageUploadCount: succesfulImageCount, failedImageList: failedImageList }
}

async function dudaFetch(payload: UploadPayload[], settings?: Settings) {
    const siteName = settings?.uploadLocation || 'c914d96aac4548c2985917d2af88827d'
    const BASE_URL = 'https://api-sandbox.duda.co'
    const dudaApiUrl = `${BASE_URL}/api/sites/multiscreen/resources/${siteName}/upload`
    const DUDA_USERNAME = process.env.DUDA_USERNAME
    const DUDA_PASSWORD = process.env.DUDA_PASSWORD

    try {
        // Encode username and password for Basic Auth
        const authStr = `${DUDA_USERNAME}:${DUDA_PASSWORD}`
        const authB64 = Buffer.from(authStr).toString('base64')
        const HEADERS = {
            Authorization: `Basic ${authB64}`,
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            Connection: 'keep-alive',
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
        }

        const response = await fetch(dudaApiUrl, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify(payload),
        })

        if (!response.ok) {
            console.error(`status text: ${response.statusText}`)
            throw response.statusText
        }

        const responseData: DudaResponse = await response.json()
        return responseData
    } catch (error) {
        throw error
    }
}
