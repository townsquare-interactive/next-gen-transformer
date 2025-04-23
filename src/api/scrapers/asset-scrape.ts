import { Browser, Page, Response } from 'playwright'
import path from 'path'
import type { ScrapeResult, Settings } from '../../services/scrape-service.js'
import {
    cleanseHtml,
    extractFormData,
    extractPageContent,
    hashUrl,
    preprocessImageUrl,
    updateImageObjWithLogo,
    isTrackingOrGoogle,
    isValidImageType,
    isValidImageSize,
    getImageDimensions,
    isStockImage,
} from './utils.js'
import { analyzePageData } from '../openai/api.js'
import { ScrapedPageSeo } from '../../schema/output-zod.js'

import { setupBrowser } from './playwright-setup.js'
import { rm } from 'fs/promises'

export interface ImageFiles {
    imageFileName: string
    fileContents: Buffer
    url: URL | null
    hashedFileName: string
    originalImageLink: string
    type?: 'logo'
    fileExtension: string
}

export interface ScrapeSiteData {
    baseUrl: string
    pages: string[]
    seo?: ScrapedPageSeo[]
    dudaUploadLocation?: string
    s3LogoUrl?: string
}

// This function needs tweaking, but conceptually this works...
async function scrollToLazyLoadImages(page: Page, millisecondsBetweenScrolling: number, url: string) {
    try {
        const visibleHeight = await page.evaluate(() => {
            return Math.min(window.innerHeight, document.documentElement.clientHeight)
        })
        let scrollsRemaining = Math.ceil(await page.evaluate((inc) => document.body.scrollHeight / inc, visibleHeight))
        //console.debug(`visibleHeight = ${visibleHeight}, scrollsRemaining = ${scrollsRemaining}`)

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

// Main scrape function
export async function scrape(settings: Settings, n: number): Promise<ScrapeResult> {
    let browser, page, tempDir
    try {
        const isHomePage = n === 0
        const setup = await setupBrowser()
        browser = setup.browser
        page = setup.page
        tempDir = setup._tempDir

        //scraping site images
        let imageFiles: ImageFiles[] = []

        //limit image scraping to the first 22 pages found
        if (settings.scrapeImages && n < 23) {
            console.log('Scraping images...')
            imageFiles = await scrapeImagesFromPage(page, browser)
        } else {
            console.log('Skipping image scrape.', settings.url)
        }

        try {
            // Before using the page, verify it's still valid
            /*             if (!browser.isConnected() || page.isClosed()) {
                console.log('Browser or page disconnected, creating new instance')
                const newSetup = await setupBrowser()
                browser = newSetup.browser
                page = newSetup.page
            }
 */
            const response = await page.goto(settings.url, {
                timeout: settings.timeoutLength || 60000,
                waitUntil: 'domcontentloaded',
            })

            if (isHomePage) {
                await page.waitForTimeout(4000)
            }
            // Check if we're still on a challenge page
            const pageTitle = await page.title()
            if (pageTitle.includes('Just a moment')) {
                console.log('Detected Cloudflare challenge page, waiting longer...', settings.url)
                await page.waitForTimeout(10000)
            }

            console.log('Page loaded, proceeding with scrape...')

            if (!response || !response.ok()) {
                if (response) {
                    console.error(`Response status: ${response.status()}`)
                    console.error(`Response headers:`, response.headers())
                    console.error(`Response body:`, await response.text().catch(() => '[Unable to read body]'))
                } else {
                    console.error(`Response object is null/undefined`)
                }
                throw new Error(`Failed to load the page: ${settings.url} (status: ${response?.status()})`)
            }

            //extract form data from pages
            const formData = await extractFormData(page)

            let screenshotBuffer
            //home page or contact page
            if (isHomePage) {
                try {
                    // Wait a bit longer for the page to stabilize
                    await page.waitForLoadState('networkidle').catch(() => console.log('Timeout waiting for network idle'))

                    // Log memory usage before screenshot
                    console.log('Taking screenshot...')

                    // Try with a more conservative screenshot approach
                    screenshotBuffer = await page
                        .screenshot({
                            fullPage: true,
                            timeout: 30000, // 30 second timeout
                            scale: 'device', // Use device scale instead of trying to scale up
                        })
                        .catch(async (error) => {
                            console.error('Screenshot failed:', error)
                            // Fallback to viewport screenshot if full page fails
                            return page.screenshot({
                                fullPage: false,
                                timeout: 15000,
                            })
                        })

                    console.log('Screenshot captured successfully')

                    imageFiles.push({
                        imageFileName: 'home-screenshot.jpg',
                        fileContents: screenshotBuffer,
                        url: null,
                        hashedFileName: '',
                        originalImageLink: '',
                        fileExtension: '.jpg',
                    })
                } catch (error) {
                    console.error('Failed to capture screenshot:', error)
                    // Continue without screenshot rather than failing the whole scrape
                    screenshotBuffer = null
                }
            }

            const seoData = await page.evaluate(() => {
                return {
                    title: document.title || '',
                    metaDescription: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
                    metaKeywords: document.querySelector('meta[name="keywords"]')?.getAttribute('content') || '',
                    ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '',
                    ogDescription: document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '',
                }
            })

            let scrapeAnalysisResult
            if (isHomePage && settings.analyzeHomepageData && screenshotBuffer) {
                console.log('Using AI to analyze page...')
                const cleanedHtml = await cleanseHtml(page) //remove unwanted elements
                scrapeAnalysisResult = await analyzePageData(settings.url, screenshotBuffer, cleanedHtml)

                if (scrapeAnalysisResult.logoTag) {
                    console.log('Found a logo src object', scrapeAnalysisResult.logoTag)
                    imageFiles = updateImageObjWithLogo(scrapeAnalysisResult.logoTag, imageFiles)
                }
            }

            //this step must be done last as it modies the DOM
            const pageTextContent = await extractPageContent(page)

            //stop lazy load image processing after 10 pages for speed reasons
            if (settings.scrapeImages && n < 11) {
                await scrollToLazyLoadImages(page, 1000, settings.url)
            }

            return {
                imageList: imageFiles.map((file) => file.originalImageLink),
                imageFiles,
                pageSeo: { ...seoData, pageUrl: settings.url },
                businessInfo: scrapeAnalysisResult,
                content: pageTextContent,
                forms: formData,
            }
        } catch (error) {
            console.error(`Detailed error info:`, {
                //browserConnected: browser?.isConnected(),
                //pageIsClosed: page?.isClosed(),
                error: error.message,
                stack: error.stack,
            })
            throw error
        }
    } catch (error) {
        console.error(`Detailed error info:`, {
            //browserConnected: browser?.isConnected(),
            //pageIsClosed: page?.isClosed(),
            error: error.message,
            stack: error.stack,
        })
        throw error
    } finally {
        try {
            console.log('asset cleanup time')
            // Close browser first
            if (browser) {
                await browser.close().catch(console.error)
            }

            // Clean up only this instance's temp directory
            if (tempDir) {
                await rm(tempDir, { recursive: true, force: true }).catch((err) => console.log(`Cleanup warning for ${tempDir}:`, err))
            }
        } catch (cleanupError) {
            console.error('Cleanup error:', cleanupError)
        }
    }
}

const scrapeImagesFromPage = async (page: Page, browser: Browser): Promise<ImageFiles[]> => {
    try {
        const imageFiles: ImageFiles[] = []
        const imagePromises: Promise<void>[] = []
        const processedUrls = new Set<string>()

        page.on('response', async (response: Response) => {
            if (response.request().resourceType() === 'image') {
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

                //skip if the content type is not an image
                const contentType = response.headers()['content-type']
                if (!contentType || !isValidImageType(contentType)) {
                    return
                }

                // Skip if page or browser is already closed
                /*                 if (page.isClosed() || browser.isConnected() === false) {
                    console.warn(`Skipping response.body() because the page or browser is closed: ${url.href}`)
                    return
                } */

                // Process image response asynchronously and store the promise
                const imageProcessingPromise = (async () => {
                    try {
                        // Skip stock images (fastest check - just URL parsing)
                        if (isStockImage(url)) {
                            return
                        }

                        const fileContents = await response.body()

                        // Rule out non image sizes (simple buffer length check)
                        if (!isValidImageSize(fileContents.length)) {
                            return
                        }

                        // Get image dimensions and check if it's a tracking pixel
                        const dimensions = await getImageDimensions(fileContents)
                        if (dimensions && isTrackingOrGoogle(url, dimensions)) {
                            return
                        }

                        const hashedName = hashUrl(response.url()) // Hash the image URL to create a unique name
                        const fileExtension = path.extname(url.pathname) || '.jpg' // Default to .jpg if no extension
                        const hashedFileName = `${hashedName}${fileExtension}`
                        const processedImageUrl = preprocessImageUrl(url) || ''
                        const fileName = processedImageUrl.split('/').pop()

                        if (!fileName) {
                            console.warn(`Unexpected parsing of URL ${url}, fileName is empty!`)
                            return
                        }

                        // Ensure file extension is properly formatted
                        const fileNameWithExt = fileName.replaceAll(fileExtension, '') + fileExtension

                        imageFiles.push({
                            imageFileName: fileNameWithExt,
                            fileContents: fileContents,
                            url: url,
                            hashedFileName: hashedFileName,
                            originalImageLink: processedImageUrl,
                            fileExtension: fileExtension,
                        })
                    } catch (err) {
                        console.log(`Error processing image response from ${url.href}:`, err)
                    }
                })()

                imagePromises.push(imageProcessingPromise)
            }
        })

        // Wait for all image processing to complete before returning
        await page.waitForLoadState('networkidle')
        await Promise.all(imagePromises)
        return imageFiles
    } catch (error) {
        console.error('Error scraping images:', error)
        throw error
    }
}
