import { DudaResponse, UploadPayload } from './save-to-duda.js'
import { Settings } from './scrape-service.js'
import { ScrapedPageSeo } from '../schema/output-zod.js'

const dudaUserName = process.env.DUDA_USERNAME
const dudaPassword = process.env.DUDA_PASSWORD
const BASE_URL = 'https://api-sandbox.duda.co'

// Encode username and password for Basic Auth
const authStr = `${dudaUserName}:${dudaPassword}`
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

export async function dudaImageFetch(payload: UploadPayload[], settings?: Settings) {
    const siteName = settings?.uploadLocation
    //https://developer.duda.co/reference/site-content-upload-resources
    const dudaApiUrl = `${BASE_URL}/api/sites/multiscreen/resources/${siteName}/upload`

    try {
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

export async function uploadSiteSEOToDuda(siteId: string, seoData: ScrapedPageSeo) {
    const updateSiteUrl = `${BASE_URL}/api/sites/multiscreen/update/${siteId}`

    const payload = {
        site_seo: {
            title: seoData.title || '',
            description: seoData.metaDescription || '',
        },
    }

    try {
        const response = await fetch(updateSiteUrl, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify(payload),
        })

        if (!response.ok) {
            console.error(`status text: ${response.statusText}`)
            throw response.statusText
        }
        if (response.status === 204) {
            console.log('site seo uploaded to duda')
            return
        }
    } catch (error) {
        throw error
    }
}
