import { Page, Response } from 'playwright'
//import chromium from 'playwright-aws-lambda'
//import { chromium as playwrightChromium } from 'playwright-core' // Import playwright-core
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'
import { convertUrlToApexId } from '../../src/utilities/utils.js'
import { ScrapingError } from '../../src/utilities/errors.js'
import { addImageToS3 } from '../../src/utilities/s3Functions.js'
import { chromium as playwrightChromium } from 'playwright'
import chromium from '@sparticuz/chromium'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface Settings {
    url: string
    storagePath: string
    method?: string
}

export async function scrapeImagesFromSite(settings: Settings) {
    const siteName = settings.url
    const dirName = convertUrlToApexId(settings.url)
    let attempt = 0
    let retries = 3
    let imageList
    while (attempt < retries) {
        try {
            imageList = await scrape({
                url: siteName,
                storagePath: path.resolve(__dirname, 'scraped-images', dirName),
                method: settings.method,
            })
            break
        } catch (error) {
            console.error(`Attempt ${attempt + 1} failed. Retrying...`)
            attempt++
            if (attempt === retries) {
                console.error(`Failed to scrape after ${retries} attempts.`)
                throw new ScrapingError({
                    domain: settings.url,
                    message: `Failed to scrape after ${retries} attempts.`,
                    state: { scrapeStatus: 'URL not able to be scraped' },
                    errorType: 'SCR-011',
                })
            }
        }
    }
    return { scrapedImages: imageList, url: siteName }

    /* } catch (err) {
        console.error('Error during scrapeImagesFromSite:', err)
        throw new ScrapingError({
            domain: settings.url,
            message: `Failed to scrape images for site: ${settings.url}. Error: ${err.message || err}`,
            state: { scrapeStatus: 'URL not able to be scraped' },
            errorType: 'SCR-011',
        })
    } */
}

/* async function scrape(settings: Settings) {
    if (settings.method === 'writeFolder') {
        fs.mkdirSync(settings.storagePath, { recursive: true })
    }

    const browser = await chromium.launch()
    const page = await browser.newPage()

    const imageList: string[] = []
    page.on('response', async (response: Response) => {
        const url = new URL(response.url())
        if (response.request().resourceType() === 'image') {
            const status = response.status()
            if (status >= 300 && status <= 399) {
                console.info(`Redirect from ${url} to ${response.headers()['location']}`)
                return
            }

            response.body().then(async (fileContents) => {
                const hashedFileName = hashUrl(response.url())
                const fileExtension = path.extname(url.pathname) || '.jpg' // Default to .jpg if no extension
                console.log('file exts', response.url().toString(), path.extname(url.pathname))
                const fileName = `${hashedFileName}${fileExtension}`
                const filePath = path.resolve(settings.storagePath, fileName)

                console.debug(`url = ${url}, filePath = ${filePath}`)
                const nonHashFileName = url.pathname.split('/').pop()?.toString() || ''
                imageList.push(nonHashFileName)

                //write files to folder system
                if (settings.method === 'writeFolder') {
                    const writeStream = fs.createWriteStream(filePath)
                    writeStream.write(fileContents)
                }

                //upload to s3 if that is the method used
                if (settings.method === 's3Upload') {
                    const basePath = convertUrlToApexId(settings.url) + '/scraped'
                    await addImageToS3(fileContents, `${basePath}/${fileName}`)
                }
            })
        }
    })

    try {
        console.log(`Attempting to load URL: ${settings.url}`)
        const response = await page.goto(settings.url, { timeout: 10000 })

        if (!response || !response.ok()) {
            throw new Error(`Failed to load the page: ${settings.url} (status: ${response?.status()})`)
        }
        console.log(`Page loaded successfully: ${settings.url}`)

        await scrollToLazyLoadImages(page, 1000)
        await browser.close()
        return imageList
    } catch (error) {
        console.error(`Error loading URL: ${settings.url}. Details: ${error.message}`)
        throw new Error(`Error loading URL: ${settings.url}. Details: ${error.message}`)
    }
} */

async function scrape(settings: Settings) {
    if (settings.method === 'writeFolder') {
        fs.mkdirSync(settings.storagePath, { recursive: true })
    }

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
    //console.log('Chromium path:', chromium.executablePath)
    //console.log('path 2', playwrightChromium.executablePath())

    if (!browser) {
        throw new Error('Chromium browser instance could not be created.')
    }

    console.log('Chromium launched.')
    const page = await browser.newPage()
    console.log('New page created.')

    const imageList: string[] = [] // This will hold the names of the scraped images
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
                const fileName = `${hashedFileName}${fileExtension}`
                const filePath = path.resolve(settings.storagePath, fileName)

                console.debug(`url = ${url}, filePath = ${filePath}`)
                const nonHashFileName = url.pathname.split('/').pop()?.toString() || ''
                imageList.push(nonHashFileName) // Add the non-hashed file name to the list of images

                // Write the file to the local folder if specified
                if (settings.method === 'writeFolder') {
                    const writeStream = fs.createWriteStream(filePath)
                    writeStream.write(fileContents)
                }

                // Upload the image to S3 if specified
                if (settings.method === 's3Upload') {
                    const basePath = convertUrlToApexId(settings.url) + '/scraped'
                    console.log('uploading images to s3')
                    await addImageToS3(fileContents, `${basePath}/${fileName}`)
                }
            })
        }
    })

    try {
        console.log(`Attempting to load URL: ${settings.url}`)
        //const response = await page.goto(settings.url, { timeout: 10000 })
        const response = await page.goto(settings.url, {
            waitUntil: 'load',
            timeout: 60000, // 60 seconds
        })

        if (!response || !response.ok()) {
            throw new Error(`Failed to load the page: ${settings.url} (status: ${response?.status()})`)
        }
        console.log(`Page loaded successfully: ${settings.url}`)

        // Scroll to load lazy-loaded images if necessary
        await scrollToLazyLoadImages(page, 1000)

        await browser.close()

        // Return the list of image names after all images are scraped
        return imageList
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
/* 
"Error scraping URL Failed to scrape images for site: https://marysmountaincookies.com. Error: Error loading URL: https://marysmountaincookies.com. Details: page.waitForTimeout: Target page, context or browser has been closed (Error ID: 4aadcf82-c998-4bac-9acd-7d143dace73d)", */
