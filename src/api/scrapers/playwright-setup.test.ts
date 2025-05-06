import { describe, expect, it } from 'vitest'
import { setupBrowser } from './playwright-setup.js'

describe('Playwright Setup', () => {
    it('should setup browser and page then connect to google', async () => {
        console.log('Starting browser...')
        const { browser, page } = await setupBrowser()
        expect(browser).toBeDefined()
        expect(page).toBeDefined()

        console.log('Navigating to Google...')
        await page.goto('https://www.google.com', {
            timeout: 60000,
            waitUntil: 'domcontentloaded',
        })
        const title = await page.title()
        const url = await page.url()

        console.log('Closing browser...')
        await browser.close()

        expect(title).toBe('Google')
        expect(url).toBe('https://www.google.com/')
    }, 15000)
})
