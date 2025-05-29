import { Page, Response } from 'playwright'
import path from 'path'
import {
    hashUrl,
    preprocessImageUrl,
    isTrackingOrGoogle,
    isValidImageType,
    isValidImageSize,
    getImageDimensions,
    isStockImage,
    isValidMediaSize,
    isValidMediaType,
} from './utils.js'
import { ImageFiles } from './asset-scrape.js'

interface DownloadOptions {
    url: URL
    contentType: string
    pageTitle: string
    responseUrl: string
    timeoutMs?: number
}

export async function scrollToLazyLoadImages(page: Page, millisecondsBetweenScrolling: number, url: string) {
    try {
        const visibleHeight = await page.evaluate(() => {
            return Math.min(window.innerHeight, document.documentElement.clientHeight)
        })
        let scrollsRemaining = Math.ceil(await page.evaluate((inc) => document.body.scrollHeight / inc, visibleHeight))

        // scroll until we're at the bottom...
        while (scrollsRemaining > 0) {
            await page.evaluate((amount) => window.scrollBy(0, amount), visibleHeight)
            await page.waitForTimeout(millisecondsBetweenScrolling)
            scrollsRemaining--
        }
    } catch (err) {
        console.error(`unable to lazy load page ${url}: `, err)
    }
}

async function downloadMediaWithTimeout(options: DownloadOptions): Promise<Buffer | null> {
    const { url, timeoutMs = 45000 } = options

    const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
            reject(new Error(`Download timeout after ${timeoutMs / 1000} seconds`))
        }, timeoutMs)
    })

    const downloadPromise = (async () => {
        const mediaResponse = await fetch(url.href)
        if (!mediaResponse.ok) {
            throw new Error(`Failed to download media file: ${url.href}, status: ${mediaResponse.status}`)
        }
        return Buffer.from(await mediaResponse.arrayBuffer())
    })()

    try {
        return await Promise.race([downloadPromise, timeoutPromise])
    } catch (error) {
        console.warn(`Skipping media file ${url.href}: ${error.message}`)
        return null
    }
}

export function createMediaFileObject(options: DownloadOptions & { fileContents: Buffer }): ImageFiles {
    const { url, contentType, pageTitle, fileContents, responseUrl } = options
    const isVideo = contentType.includes('video')
    const fileExtension = path.extname(url.pathname) || (isVideo ? '.mp4' : '.mp3')
    const hashedName = hashUrl(responseUrl)
    const hashedFileName = `${hashedName}${fileExtension}`

    return {
        imageFileName: url.pathname.split('/').pop() || `media${fileExtension}`,
        fileContents,
        url,
        hashedFileName,
        originalImageLink: url.href,
        type: isVideo ? 'video' : 'audio',
        fileExtension,
        pageTitle,
        src: url.href,
    }
}

export async function processMediaResponse(options: DownloadOptions): Promise<ImageFiles | null> {
    const { url, contentType } = options
    const fileContents = await downloadMediaWithTimeout(options)
    if (!fileContents) return null

    if (!isValidMediaSize(fileContents.length)) {
        console.log(`Skipping media file due to size constraints: ${url.href}`)
        return null
    }

    const mediaFile = createMediaFileObject({ ...options, fileContents })
    console.log(`Successfully downloaded ${contentType} file: ${url.href}`)
    return mediaFile
}

export async function processImageResponse(options: DownloadOptions & { response: Response }): Promise<ImageFiles | null> {
    const { url, response, contentType, pageTitle } = options

    // Skip stock images (fastest check - just URL parsing)
    if (isStockImage(url)) {
        return null
    }

    const fileContents = await response.body()

    // Rule out invalid media sizes
    if (!isValidImageSize(fileContents.length)) {
        return null
    }

    // Check dimensions and tracking pixels
    const dimensions = await getImageDimensions(fileContents)
    if (dimensions && isTrackingOrGoogle(url, dimensions)) {
        return null
    }

    const hashedName = hashUrl(response.url())
    const fileExtension = path.extname(url.pathname) || '.jpg'
    const hashedFileName = `${hashedName}${fileExtension}`
    const processedUrl = preprocessImageUrl(url) || ''
    const fileName = processedUrl.split('/').pop()

    if (!fileName) {
        console.warn(`Unexpected parsing of URL ${url}, fileName is empty!`)
        return null
    }

    // Ensure file extension is properly formatted
    const fileNameWithExt = fileName.replaceAll(fileExtension, '') + fileExtension

    return {
        imageFileName: fileNameWithExt,
        fileContents,
        url,
        hashedFileName,
        originalImageLink: processedUrl,
        type: 'image',
        fileExtension,
        pageTitle,
    }
}

export const scrapeMediaFromPage = async (page: Page, pageTitle: string): Promise<ImageFiles[]> => {
    try {
        const mediaFiles: ImageFiles[] = []
        const mediaPromises: Promise<void>[] = []
        const processedUrls = new Set<string>()

        page.on('response', async (response: Response) => {
            const resourceType = response.request().resourceType()
            if (resourceType === 'image' || resourceType === 'media') {
                const url = new URL(response.url())
                // Skip if we've already processed this URL
                if (processedUrls.has(url.href)) {
                    return
                }
                processedUrls.add(url.href)

                // Handle possible redirect
                const status = response.status()
                if (status >= 300 && status <= 399) {
                    return
                }

                //skip if the content type is not a valid media type
                const contentType = response.headers()['content-type']
                if (!contentType || !isValidMediaType(contentType)) {
                    return
                }

                // Skip if page or browser is already closed
                if (page.isClosed()) {
                    console.warn(`Skipping response.body() because the page or browser is closed: ${url.href}`)
                    return
                }

                // Process media response asynchronously and store the promise
                const mediaProcessingPromise = (async () => {
                    try {
                        const options: DownloadOptions = {
                            url,
                            contentType,
                            pageTitle,
                            responseUrl: response.url(),
                        }

                        let mediaFile: ImageFiles | null = null

                        if (contentType.includes('video') || contentType.includes('audio')) {
                            mediaFile = await processMediaResponse(options)
                        } else if (isValidImageType(contentType)) {
                            mediaFile = await processImageResponse({ ...options, response })
                        }

                        if (mediaFile) {
                            mediaFiles.push(mediaFile)
                        }
                    } catch (err) {
                        console.log(`Error processing media response from ${url.href}:`, err)
                    }
                })()

                mediaPromises.push(mediaProcessingPromise)
            }
        })

        // Wait for all media processing to complete before returning
        await page.waitForLoadState('networkidle')
        await Promise.all(mediaPromises)

        return mediaFiles
    } catch (error) {
        console.error('Error scraping media:', error)
        throw error
    }
}
