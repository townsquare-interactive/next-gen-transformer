import type { ScrapeResult, Settings } from '../../services/scrape-service.js'
import { cleanHtmlForAnalysis, extractFormData, extractPageContent, updateImageObjWithLogo, convertTitleToReadableFormat } from './utils.js'
import { analyzePageData } from '../openai/api.js'
import { ScrapedPageSeo } from '../../schema/output-zod.js'
import { setupBrowser } from './playwright-setup.js'
import { extractIframeContent, scrapeMediaFromPage, scrollToLazyLoadImages } from './scrape-media.js'

export interface ImageFiles {
    imageFileName: string
    fileContents: Buffer
    url: URL | null
    hashedFileName: string
    originalImageLink: string
    type?: 'logo' | 'image' | 'video' | 'audio'
    fileExtension: string
    pageTitle: string
    src?: string
}

export interface ScrapeSiteData {
    baseUrl: string
    pages: string[]
    seo?: ScrapedPageSeo[]
    dudaUploadLocation?: string
    s3LogoUrl?: string
}

export async function scrape(settings: Settings, n: number, analyzePage = false): Promise<ScrapeResult> {
    const { browser, page } = await setupBrowser()
    const isHomePage = n === 0

    let mediaFiles: ImageFiles[] = []

    //limit image scraping to the first 26 pages found
    if (settings.scrapeImages && n < 27) {
        console.log('Scraping images...')
        const pageTitle = convertTitleToReadableFormat(settings.url)
        mediaFiles = await scrapeMediaFromPage(page, pageTitle)
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

        const iframeContent = await extractIframeContent(page)

        let screenshotBuffer
        if (isHomePage || analyzePage) {
            screenshotBuffer = await page.screenshot({ fullPage: true })

            mediaFiles.push({
                imageFileName: 'home-screenshot.jpg',
                fileContents: screenshotBuffer,
                url: null, //setting this to undefined prevents Duda uploading
                hashedFileName: '',
                originalImageLink: '',
                fileExtension: '.jpg',
                pageTitle: 'Home',
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
        if ((isHomePage || analyzePage) && screenshotBuffer) {
            console.time(`AI Analysis Duration ${settings.url}`)
            console.log(`Using AI to analyze page ${settings.url}...`)
            const cleanedHtml = await cleanHtmlForAnalysis(page) //remove unwanted elements
            scrapeAnalysisResult = await analyzePageData(settings.url, screenshotBuffer, cleanedHtml)

            if (scrapeAnalysisResult.logoTag && isHomePage) {
                console.log('Found a logo src object', scrapeAnalysisResult.logoTag)
                mediaFiles = updateImageObjWithLogo(scrapeAnalysisResult.logoTag, mediaFiles)
            }
        }

        //stop lazy load image processing after 15 pages for speed reasons
        if (settings.scrapeImages && n < 16) {
            await scrollToLazyLoadImages(page, 1000, settings.url)
        }

        await browser.close()

        return {
            imageList: mediaFiles.map((file) => file.originalImageLink),
            imageFiles: mediaFiles,
            pageSeo: { ...seoData, pageUrl: settings.url },
            businessInfo: scrapeAnalysisResult,
            content: pageTextContent,
            forms: formData,
            iframeContent: iframeContent,
        }
    } catch (error) {
        console.error(`Error scraping URL: ${settings.url}. Details: ${error.message}`)
        throw error
    }
}
