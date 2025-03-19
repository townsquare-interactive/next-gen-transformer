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
            const links: HTMLAnchorElement[] = Array.from(
                navExists ? document.querySelectorAll('nav a[href], header a[href]') : document.querySelectorAll('a[href]')
            )

            return links
                .map((link) => link.href)
                .filter((href) => {
                    return (
                        href.startsWith('http') && !href.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) // Exclude image links
                    )
                })
        })

        foundUrls.add(normalizeUrl(settings.url))
        for (let x = 0; x < pageUrls.length; x++) {
            const currentUrl = pageUrls[x]
            const normalizedUrl = normalizeUrl(pageUrls[x])

            if (!foundUrls.has(normalizedUrl) && domainsMatch(settings.url, currentUrl)) {
                if (!currentUrl.includes('#')) {
                    foundUrls.add(normalizedUrl)
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
export function domainsMatch(baseUrl: string, testUrl: string): boolean {
    const base = new URL(baseUrl)
    const test = new URL(testUrl)

    // Check if hostnames match (with or without www)
    const hostnameMatch = base.hostname === test.hostname || base.hostname.replace(/^www\./, '') === test.hostname.replace(/^www\./, '')

    // If hostnames don't match, return false immediately
    if (!hostnameMatch) return false

    // Special handling for root paths
    const isBaseRoot = base.pathname === '/' || base.pathname === ''
    const isTestRoot = test.pathname === '/' || test.pathname === ''

    if (isBaseRoot && isTestRoot) {
        // If both are root paths, treat them as the same
        return true
    }

    // For all other cases, just check if they're on the same domain
    return hostnameMatch
}

// Helper function to normalize URLs (can be placed near domainsMatch function)
export function normalizeUrl(url: string): string {
    const urlObj = new URL(url)
    // Remove trailing slashes and convert to lowercase
    return urlObj.origin + urlObj.pathname.replace(/\/+$/, '') || '/'
}
