import type { Settings } from '../../src/controllers/scrape-controller.js'
import { setupBrowser } from './playwright-setup.js'

export async function findPages(settings: Settings) {
    try {
        const foundUrls = new Set<string>()
        const { browser, page } = await setupBrowser()
        console.log(`Loading main page: ${settings.url}`)

        const response = await page.goto(settings.url, {
            timeout: settings.timeoutLength || 60000,
            //waitUntil: 'networkidle', // Wait until network is idle
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

        // Wait a moment for any security challenges to complete
        await page.waitForTimeout(5000)

        // Check if we're still on a challenge page
        const pageTitle = await page.title()
        if (pageTitle.includes('Just a moment')) {
            console.log('Detected Cloudflare challenge page, waiting longer...')
            await page.waitForTimeout(10000)
        }

        console.log('Page loaded, proceeding with scrape...')

        // Logic to find links to other pages
        const pageUrls = await page.evaluate(() => {
            const navExists = document.querySelector('nav') !== null
            const links: HTMLAnchorElement[] = Array.from(navExists ? document.querySelectorAll('nav a[href]') : document.querySelectorAll('a[href]'))
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

        //filter out Urls with multiple paths to avoid product pages
        /*  let filteredUrlArray = urlArray
        if (urlArray.length > 30) {
            filteredUrlArray = urlArray.filter((url) => {
                const urlPath = new URL(url).pathname
                // Keep URLs with no path or just one path segment
                return urlPath === '/' || urlPath.split('/').filter(Boolean).length <= 1
            })
        } */
        //console.log(`Found ${filteredUrlArray.length} filteredpages:`, filteredUrlArray)

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
