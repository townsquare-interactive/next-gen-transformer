import { Browser, Page, Response } from 'playwright'
import path from 'path'
import { chromium as playwrightChromium } from 'playwright'
import chromium from '@sparticuz/chromium'
import type { ScrapeResult, Settings } from '../../src/controllers/scrape-controller.js'
import { cleanseHtml, extractFormData, extractPageContent, hashUrl, preprocessImageUrl, updateImageObjWithLogo } from './utils.js'
import { analyzePageData } from '../openai/api.js'
import { ScrapedPageSeo } from '../../src/schema/output-zod.js'

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

// Main scrape function
export async function scrape(settings: Settings, n: number): Promise<ScrapeResult> {
    const browser = await playwrightChromium
        .launch({
            headless: false,
            executablePath: process.env.AWS_EXECUTION_ENV ? await chromium.executablePath() : undefined,
            args: [...chromium.args, '--no-sandbox', '--disable-gpu', '--disable-setuid-sandbox'],
        })
        .catch((error) => {
            console.error('Failed to launch Chromium:', error)
            throw error
        })
    if (!browser) {
        throw new Error('Chromium browser instance could not be created.')
    }

    const page = await browser.newPage()
    const isHomePage = n === 0

    //scraping site images
    let imageFiles: ImageFiles[] = []

    //limit image scraping to the first 8 pages found
    if (settings.scrapeImages) {
        console.log('Scraping images...')
        imageFiles = await scrapeImagesFromPage(page, browser)
    } else {
        console.log('Skipping image scrape.', settings.url)
    }

    try {
        const response = await page.goto(settings.url, {
            timeout: settings.timeoutLength || 60000,
        })

        if (!response || !response.ok()) {
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

        let scrapeAnalysisResult
        if (isHomePage && settings.useAi && screenshotBuffer) {
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
            await scrollToLazyLoadImages(page, 1000)
        }
        await browser.close()

        return {
            imageList: imageFiles.map((file) => file.originalImageLink),
            imageFiles,
            pageSeo: { ...seoData, pageUrl: settings.url },
            aiAnalysis: scrapeAnalysisResult,
            content: pageTextContent,
            forms: formData,
        }
    } catch (error) {
        console.error(`Error scraping URL: ${settings.url}. Details: ${error.message}`)
        throw error
    }
}

const scrapeImagesFromPage = async (page: Page, browser: Browser): Promise<ImageFiles[]> => {
    try {
        const imageFiles: ImageFiles[] = []
        const imagePromises: Promise<void>[] = [] // Store all async image processing

        page.on('response', async (response: Response) => {
            if (response.request().resourceType() === 'image') {
                const url = new URL(response.url())

                // Handle possible redirect
                const status = response.status()
                if (status >= 300 && status <= 399) {
                    console.info(`Redirect from ${url} to ${response.headers()['location']}`)
                    return
                }

                const contentType = response.headers()['content-type']
                if (!contentType || !contentType.startsWith('image/')) {
                    console.log(`Skipping non-image URL: ${url.href}`)
                    return
                }

                // Skip if page or browser is already closed
                if (page.isClosed() || browser.isConnected() === false) {
                    console.warn(`Skipping response.body() because the page or browser is closed: ${url.href}`)
                    return
                }

                // Process image response asynchronously and store the promise
                const imageProcessingPromise = (async () => {
                    try {
                        const fileContents = await response.body()
                        const hashedName = hashUrl(response.url()) // Hash the image URL to create a unique name
                        const fileExtension = path.extname(url.pathname) || '.jpg' // Default to .jpg if no extension
                        const hashedFileName = `${hashedName}${fileExtension}`
                        const processedImageUrl = preprocessImageUrl(url) || ''
                        const fileName = processedImageUrl.split('/').pop()

                        if (!fileName) {
                            console.warn(`Unexpected parsing of URL ${url}, fileName is empty!`)
                            return
                        }

                        // Filter out requests for tracking
                        if (fileName.endsWith('=FGET')) {
                            console.log(`Skipping URL with invalid extension =fget: ${url.href}`)
                            return
                        }

                        // Ensure file extension is properly formatted
                        let fileNameWithExt = fileName.replaceAll(fileExtension, '') + fileExtension

                        imageFiles.push({
                            imageFileName: fileNameWithExt,
                            fileContents: fileContents,
                            url: url,
                            hashedFileName: hashedFileName,
                            originalImageLink: processedImageUrl,
                            fileExtension: fileExtension,
                        })
                    } catch (err) {
                        console.error(`Error processing image response from ${url.href}:`, err)
                    }
                })()

                imagePromises.push(imageProcessingPromise) // Store the promise
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

// This function needs tweaking, but conceptually this works...
async function scrollToLazyLoadImages(page: Page, millisecondsBetweenScrolling: number) {
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
}
