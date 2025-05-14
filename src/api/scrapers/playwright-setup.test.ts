import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { setupBrowser } from './playwright-setup.js'
import type { BrowserContext, Page } from 'playwright'

describe('Playwright Setup', () => {
    let browser: BrowserContext
    let page: Page

    beforeEach(async () => {
        const setup = await setupBrowser()
        browser = setup.browser
        page = setup.page
    })

    afterEach(async () => {
        await browser.close()
    })

    /*     it('should setup browser and page then connect to google', async () => {
        expect(browser).toBeDefined()
        expect(page).toBeDefined()

        console.log('Navigating to Google...')
        await page.goto('https://www.google.com', {
            timeout: 60000,
            waitUntil: 'domcontentloaded',
        })
        const title = await page.title()
        const url = await page.url()

        expect(title).toBe('Google')
        expect(url).toBe('https://www.google.com/')

        // Check for navigating common bot detection flags
        const webdriver = await page.evaluate(() => navigator.webdriver)
        expect(webdriver).toBeFalsy()

        const plugins = await page.evaluate(() => navigator.plugins.length)
        expect(plugins).toBeGreaterThan(0)
    }, 22000) */

    /*     it('should handle navigation timeouts gracefully', async () => {
        await expect(
            page.goto('https://example.com', {
                timeout: 1, // Intentionally low timeout
                waitUntil: 'networkidle',
            })
        ).rejects.toThrow('Timeout')
    }, 22000) */

    it('should handle multiple page creation', async () => {
        const secondPage = await browser.newPage()
        expect(secondPage).toBeDefined()
        await secondPage.close()
    }, 22000)
})
