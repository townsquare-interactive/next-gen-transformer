/* import fetch from 'node-fetch' */
import type { Settings, ImageFiles } from '../../api/scrapers/image-scrape.js'
import { preprocessImageUrl } from '../../api/scrapers/utils.js'
import { ScrapingError } from '../utilities/errors.js'

interface UploadPayload {
    resource_type: 'IMAGE'
    src: string
    folder: string
}

interface DudaResponse {
    success: boolean
    message?: string
    uploaded_resources?: {
        id: string
        src: string
        original_url?: string
        new_url?: string
        status?: 'UPLOADED' | 'NOT_FOUND'
    }[]
}

export async function save(settings: Settings, imageFiles: ImageFiles[], fetchFunction?: (payload: UploadPayload[]) => DudaResponse): Promise<DudaResponse[]> {
    const batchResults: DudaResponse[] = []

    for (let i = 0; i < imageFiles.length; i += 10) {
        const batch = imageFiles.slice(i, i + 10)

        const payload: UploadPayload[] = batch
            .map((item) => {
                const processedUrl = preprocessImageUrl(item.url)
                if (!processedUrl) return null // Return null for duplicates or invalid URLs
                return {
                    resource_type: 'IMAGE',
                    src: processedUrl,
                    folder: 'Imported',
                }
            })
            .filter((item): item is UploadPayload => item !== null) // Filter out null entries

        const dudaFetchFunction = fetchFunction ? fetchFunction : dudaFetch

        try {
            const responseData = await dudaFetchFunction(payload, settings)
            batchResults.push(responseData)
        } catch (error) {
            console.error(`Error uploading batch: ${error}`)
            throw new ScrapingError({
                domain: settings.url,
                message: 'failed to upload batch images: ' + error.message,
                state: { scrapeStatus: 'Images not uploaded' },
                errorType: 'SCR-012',
            })
        }
    }

    console.log('batch upload results', batchResults[0]?.uploaded_resources)
    console.log(`Total batches uploaded: ${batchResults.length}`)

    return batchResults
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
            console.error(`${response.statusText}`)
            throw 'failed to upload batch images'
        }

        const responseData: DudaResponse = await response.json()
        return responseData
    } catch (error) {
        throw 'failed to upload batch images'
    }
}
