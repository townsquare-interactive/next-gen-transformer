import { Page, Response } from 'playwright'
import path from 'path'
import { chromium as playwrightChromium } from 'playwright'
import chromium from '@sparticuz/chromium'
import type { ScrapeResult, ScrapedPageSeo, Settings } from '../../src/controllers/scrape-controller.js'
import { hashUrl, preprocessImageUrl, updateImageObjWithLogo } from './utils.js'
import { capturePageAndAnalyze } from '../openai/api.js'

export interface ImageFiles {
    imageFileName: string
    fileContents: any
    url: any
    hashedFileName: string
    originalImageLink: string
    type?: 'logo'
    fileExtension: string
}

export interface ScrapeSiteData {
    baseUrl: string
    pages: string[]
    seolist?: ScrapedPageSeo[]
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
    let imageFiles: ImageFiles[] = []

    //scraping site images
    if (settings.scrapeImages) {
        console.log('Scraping images...')
        imageFiles = await scrapeImagesFromPage(page)
    } else {
        console.log('Skipping image scrape.')
    }

    try {
        const response = await page.goto(settings.url, {
            timeout: settings.timeoutLength || 60000,
        })

        if (!response || !response.ok()) {
            throw new Error(`Failed to load the page: ${settings.url} (status: ${response?.status()})`)
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

        const pageTextContent = await extractPageContent(page)

        let scrapeAnalysisResult
        if (n === 0 && settings.useAi) {
            console.log('Using AI to analyze page...')
            scrapeAnalysisResult = await capturePageAndAnalyze(page, settings.url)
            if (scrapeAnalysisResult.logoTag) {
                console.log('Found a logo src object', scrapeAnalysisResult.logoTag)
                imageFiles = updateImageObjWithLogo(scrapeAnalysisResult.logoTag, imageFiles)
            }
        }

        await scrollToLazyLoadImages(page, 1000)
        await browser.close()

        return {
            imageList: imageFiles.map((file) => file.originalImageLink),
            imageFiles,
            pageSeo: { ...seoData, pageUrl: settings.url },
            aiAnalysis: scrapeAnalysisResult,
            content: pageTextContent,
        }
    } catch (error) {
        console.error(`Error scraping URL: ${settings.url}. Details: ${error.message}`)
        throw error
    }
}

// Separate function to handle image scraping
const scrapeImagesFromPage = async (page: Page): Promise<ImageFiles[]> => {
    const imageFiles: ImageFiles[] = []

    page.on('response', async (response: Response) => {
        const url = new URL(response.url())
        if (response.request().resourceType() === 'image') {
            //handle possible redirect
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

            // Get the image content
            response.body().then(async (fileContents) => {
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
                if (fileName?.endsWith('=FGET')) {
                    console.log(`Skipping URL with invalid extension =fget: ${url.href}`)
                    return
                }

                // Make sure file extension is at the end
                let fileNameWithExt = fileName?.replaceAll(fileExtension, '') + fileExtension

                imageFiles.push({
                    imageFileName: fileNameWithExt,
                    fileContents: fileContents,
                    url: url,
                    hashedFileName: hashedFileName,
                    originalImageLink: processedImageUrl,
                    fileExtension: fileExtension,
                })
            })
        }
    })

    return imageFiles
}

// This function needs tweaking, but conceptually this works...
async function scrollToLazyLoadImages(page: Page, millisecondsBetweenScrolling: number) {
    const visibleHeight = await page.evaluate(() => {
        return Math.min(window.innerHeight, document.documentElement.clientHeight)
    })
    let scrollsRemaining = Math.ceil(await page.evaluate((inc) => document.body.scrollHeight / inc, visibleHeight))
    console.debug(`visibleHeight = ${visibleHeight}, scrollsRemaining = ${scrollsRemaining}`)

    // scroll until we're at the bottom...
    while (scrollsRemaining > 0) {
        await page.evaluate((amount) => window.scrollBy(0, amount), visibleHeight)
        await page.waitForTimeout(millisecondsBetweenScrolling)
        scrollsRemaining--
    }
}

const extractPageContent = async (page: Page) => {
    const pageTextContent = await page.evaluate(() => {
        // Unwanted tags for content scrape
        const unwantedSelectors = ['nav', 'footer', 'script', 'style']

        unwantedSelectors.forEach((selector) => {
            document.querySelectorAll(selector).forEach((el) => el.remove())
        })

        // Remove <header> content without removing headline tags
        document.querySelectorAll('header *:not(h1):not(h2):not(h3):not(h4):not(h5):not(h6)').forEach((el) => {
            el.remove()
        })

        // Return visible text content
        return document.body.innerText.trim()
    })

    return pageTextContent
}
