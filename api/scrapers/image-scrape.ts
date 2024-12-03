import { Page, Response } from 'playwright'
import path from 'path'
import crypto from 'crypto'
import { ScrapingError } from '../../src/utilities/errors.js'
import { chromium as playwrightChromium } from 'playwright'
//sparticuz/chromium package needed to get playwright working correctly on vercel
import chromium from '@sparticuz/chromium'
import { SaveFileMethodType } from '../../src/schema/input-zod.js'
import { fileURLToPath } from 'url'

export interface Settings {
    url: string
    saveMethod?: SaveFileMethodType
    timeoutLength?: number
    retries?: number
    scrapeFunction?: (settings: Settings) => ScrapeResult
    uploadLocation?: string
}

interface ScrapeResult {
    imageList: string[]
    imageFiles: ImageFiles[]
}

export interface ImageFiles {
    hashedFileName: string
    fileContents: any
    url: string
}

export async function scrapeImagesFromSite(settings: Settings) {
    const siteName = settings.url
    let attempt = 0
    let retries = settings.retries || 3
    let imageData
    const scrapeFunction = settings.scrapeFunction || scrape
    console.log('retry count', retries)
    while (attempt < retries) {
        try {
            imageData = await scrapeFunction({
                ...settings,
            })
            break
        } catch (error) {
            console.error(`Attempt ${attempt + 1} failed. Retrying...`)
            attempt++
            if (attempt === retries) {
                console.error(`Failed to scrape after ${retries} attempts.`)
                throw new ScrapingError({
                    domain: settings.url,
                    message: error.message,
                    state: { scrapeStatus: 'URL not able to be scraped' },
                    errorType: 'SCR-011',
                })
            }
        }
    }
    return { imageNames: imageData?.imageList, url: siteName, imageFiles: imageData?.imageFiles }
}

export async function scrape(settings: Settings) {
    // Launch Chromium with the appropriate arguments
    const browser = await playwrightChromium
        .launch({
            headless: false,
            executablePath: process.env.AWS_EXECUTION_ENV
                ? await chromium.executablePath() // Use Sparticuz Chromium executable in AWS or Vercel
                : undefined, // Use default Playwright binary locally
            args: [
                ...chromium.args, // Include Chromium's recommended args
                '--no-sandbox', // Disable sandbox for serverless compatibility
                '--disable-gpu', // Disable GPU rendering
                '--disable-setuid-sandbox',
            ],
        })
        .catch((error) => {
            console.error('Failed to launch Chromium:', error)
            throw error
        })
    console.log('Chromium executable path:', playwrightChromium.executablePath())

    if (!browser) {
        throw new Error('Chromium browser instance could not be created.')
    }

    console.log('Chromium launched.')
    const page = await browser.newPage()
    console.log('New page created.')

    const imageList: string[] = [] // names of scraped images
    const imageFiles: any = [] //actual scraped image file contents
    page.on('response', async (response: Response) => {
        const url = new URL(response.url())
        if (response.request().resourceType() === 'image') {
            const status = response.status()
            if (status >= 300 && status <= 399) {
                console.info(`Redirect from ${url} to ${response.headers()['location']}`)
                return
            }

            // Get the image content
            response.body().then(async (fileContents) => {
                const hashedFileName = hashUrl(response.url()) // Hash the image URL to create a unique name
                const fileExtension = path.extname(url.pathname) || '.jpg' // Default to .jpg if no extension
                //const fileName = `${hashedFileName}${fileExtension}`

                //file logging stuff
                const __filename = fileURLToPath(import.meta.url)
                //const __dirname = path.dirname(__filename)
                const fileName = url.pathname.split('/').pop()
                if (!fileName) {
                    console.warn(`Unexpected parsing of url ${url}, fileName is empty!`)
                    return
                }
                //const storagePath = path.resolve(__dirname, 'scraped-images', dirName)
                //const filePath = path.resolve(settings.storagePath, fileName)
                /* console.debug(`url = ${url}, filePath = ${filePath}`) */
                //const filePath = path.resolve(settings.storagePath, fileName)
                //const storagePath = path.resolve(__dirname, 'scraped-images', dirName)
                //const filePath = path.resolve(storagePath, hashedFileName)
                //const writeStream = fs.createWriteStream(filePath)

                console.debug(`url = ${url}, filePath = ${fileName}`)

                const nonHashFileName = url.pathname.split('/').pop()?.toString() || ''
                imageList.push(nonHashFileName) // Add the non-hashed file name to the list of images
                imageFiles.push({ hashedFileName: fileName, fileContents: fileContents, url: url })
            })
        }
    })

    try {
        console.log(`Attempting to load URL: ${settings.url}`)
        const response = await page.goto(settings.url, {
            timeout: settings.timeoutLength || 60000,
        })

        if (!response || !response.ok()) {
            throw new Error(`Failed to load the page: ${settings.url} (status: ${response?.status()})`)
        }
        console.log(`Page loaded successfully: ${settings.url}`)

        // Scroll to load lazy-loaded images if necessary
        await scrollToLazyLoadImages(page, 1000)
        await browser.close()

        // Return the list of image names after all images are scraped
        return { imageList: imageList, imageFiles: imageFiles }
    } catch (error) {
        console.error(`Error loading URL: ${settings.url}. Details: ${error.message}`)
        throw new Error(`Error loading URL: ${settings.url}. Details: ${error.message}`)
    }
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

function hashUrl(url: string): string {
    return crypto.createHash('md5').update(url).digest('hex')
}
