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
        await page.setExtraHTTPHeaders({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
        })
        console.log(`Loading main page: ${settings.url}`)

        const response = await page.goto(settings.url, {
            timeout: settings.timeoutLength || 60000,
        })

        if (!response || !response.ok()) {
            console.error(`Failed to load the page: ${settings.url}`)
            if (response) {
                console.error(`Response status: ${response.status()}`)
                console.error(`Response headers:`, response.headers())
                console.error(`Response body:`, await response.text().catch(() => '[Unable to read body]'))
            } else {
                console.error(`Response object is null/undefined`)
            }
            await browser.close()
            throw new Error(`Failed to load the page: ${settings.url}`)
        }

        console.log(`Main page loaded successfully: ${settings.url}`)

        // Logic to find links to other pages
        const pageUrls = await page.evaluate(() => {
            const links: HTMLAnchorElement[] = Array.from(document.querySelectorAll('a[href]'))
            return links
                .map((link) => link.href)
                .filter((href) => {
                    return (
                        href.startsWith('http') && !href.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) // Exclude image links
                    )
                })
        })

        foundUrls.add(settings.url)
        for (let x = 0; x < pageUrls.length; x++) {
            const currentUrl = pageUrls[x]

            if (!foundUrls.has(currentUrl) && urlsMatch(settings.url, currentUrl)) {
                if (!currentUrl.includes('#')) {
                    foundUrls.add(currentUrl)
                }
            }
        }

        const urlArray = Array.from(foundUrls)

        console.log(`Found ${urlArray.length} pages:`, urlArray)
        await browser.close()

        return urlArray
    } catch (error) {
        throw error
    }
}

//make sure the URLs are not the same with www. or without
function urlsMatch(baseUrl: string, testUrl: string): boolean {
    const base = new URL(baseUrl)
    const test = new URL(testUrl)

    return base.hostname === test.hostname || base.hostname.replace(/^www\./, '') === test.hostname.replace(/^www\./, '')
}
