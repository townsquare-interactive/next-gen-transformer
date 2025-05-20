import { BrowserContext, Page, Response } from 'playwright'
import path from 'path'
import type { ScrapeResult, Settings } from '../../services/scrape-service.js'
import {
    cleanHtmlForAnalysis,
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
    const { browser, page } = await setupBrowser()
    const isHomePage = n === 0

    //scraping site images
    let imageFiles: ImageFiles[] = []

    //limit image scraping to the first 26 pages found
    if (settings.scrapeImages && n < 27) {
        console.log('Scraping images...')
        imageFiles = await scrapeImagesFromPage(page, browser)
    } else {
        console.log('Skipping image scrape.', settings.url)
    }

    try {
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
            screenshotBuffer = await page.screenshot({ fullPage: true })

            imageFiles.push({
                imageFileName: 'home-screenshot.jpg',
                fileContents: screenshotBuffer,
                url: null, //setting this to undefined prevents Duda uploading
                hashedFileName: '',
                originalImageLink: '',
                fileExtension: '.jpg',
            })
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

        const pageTextContent = await extractPageContent(page, isHomePage)

        //this step must be done last as it modies the DOM
        let scrapeAnalysisResult
        if (isHomePage && screenshotBuffer) {
            console.log('Using AI to analyze page...')
            const cleanedHtml = await cleanHtmlForAnalysis(page) //remove unwanted elements
            scrapeAnalysisResult = await analyzePageData(settings.url, screenshotBuffer, cleanedHtml)

            if (scrapeAnalysisResult.logoTag) {
                console.log('Found a logo src object', scrapeAnalysisResult.logoTag)
                imageFiles = updateImageObjWithLogo(scrapeAnalysisResult.logoTag, imageFiles)
            }
        }

        //stop lazy load image processing after 15 pages for speed reasons
        if (settings.scrapeImages && n < 16) {
            await scrollToLazyLoadImages(page, 1000, settings.url)
        }
        await browser.close()

        return {
            imageList: imageFiles.map((file) => file.originalImageLink),
            imageFiles,
            pageSeo: { ...seoData, pageUrl: settings.url },
            businessInfo: scrapeAnalysisResult,
            content: pageTextContent,
            forms: formData,
        }
    } catch (error) {
        console.error(`Error scraping URL: ${settings.url}. Details: ${error.message}`)
        throw error
    }
}

const scrapeImagesFromPage = async (page: Page, browser: BrowserContext): Promise<ImageFiles[]> => {
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
                if (page.isClosed()) {
                    console.warn(`Skipping response.body() because the page or browser is closed: ${url.href}`)
                    return
                }

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
