import { chromium as playwrightChromium } from 'playwright'
//sparticuz/chromium package needed to get playwright working correctly on vercel
import chromium from '@sparticuz/chromium'
import type { Settings } from '../../src/controllers/scrape-controller.js'

//const seenImages = new Set<string>()
export async function findPages(settings: Settings) {
    try {
        const foundUrls = new Set<string>()
        const browser = await playwrightChromium.launch({
            headless: false,
            executablePath: process.env.AWS_EXECUTION_ENV ? await chromium.executablePath() : undefined,
            args: [...chromium.args, '--no-sandbox', '--disable-gpu', '--disable-setuid-sandbox'],
        })

        const page = await browser.newPage()
        console.log(`Loading main page: ${settings.url}`)

        const response = await page.goto(settings.url, {
            timeout: settings.timeoutLength || 60000,
        })

        if (!response || !response.ok()) {
            console.error(`Failed to load the page: ${settings.url}`)
            await browser.close()
            throw new Error(`Failed to load the page: ${settings.url}`)
        }

        console.log(`Main page loaded successfully: ${settings.url}`)

        // Logic to find links to other pages
        const pageUrls = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('a[href]'))
            return links.map((link: any) => link.href).filter((href) => href.startsWith('http'))
        })

        for (let x = 0; x < pageUrls.length; x++) {
            const currentUrl = pageUrls[x]
            //remove duplicates
            if (!foundUrls.has(currentUrl) && currentUrl.includes(settings.url)) {
                if (!currentUrl.includes('#')) {
                    foundUrls.add(currentUrl)
                }
            }
        }
        console.log(foundUrls)

        const urlArray = Array.from(foundUrls)

        console.log(`Found ${urlArray.length} pages:`, urlArray)
        await browser.close()

        return urlArray
    } catch (error) {
        throw error
    }
}
