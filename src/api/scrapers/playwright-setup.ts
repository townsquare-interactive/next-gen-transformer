import chromium from '@sparticuz/chromium'
import { addExtra } from 'playwright-extra'
import { chromium as pw, BrowserContext, Page } from 'playwright'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
//import { chromium as playwrightChromium } from 'playwright'
//import { chromium as playwrightChromium } from 'playwright-extra'
import 'puppeteer-extra-plugin-stealth/evasions/chrome.app/index.js'
import 'puppeteer-extra-plugin-stealth/evasions/chrome.csi/index.js'
import 'puppeteer-extra-plugin-stealth/evasions/chrome.loadTimes/index.js'
import 'puppeteer-extra-plugin-stealth/evasions/chrome.runtime/index.js'
import 'puppeteer-extra-plugin-stealth/evasions/iframe.contentWindow/index.js'
import 'puppeteer-extra-plugin-stealth/evasions/media.codecs/index.js'
import 'puppeteer-extra-plugin-stealth/evasions/navigator.hardwareConcurrency/index.js'
import 'puppeteer-extra-plugin-stealth/evasions/navigator.languages/index.js'
import 'puppeteer-extra-plugin-stealth/evasions/navigator.permissions/index.js'
import 'puppeteer-extra-plugin-stealth/evasions/navigator.plugins/index.js'
import 'puppeteer-extra-plugin-stealth/evasions/navigator.vendor/index.js'
import 'puppeteer-extra-plugin-stealth/evasions/navigator.webdriver/index.js'
import 'puppeteer-extra-plugin-stealth/evasions/sourceurl/index.js'
import 'puppeteer-extra-plugin-stealth/evasions/user-agent-override/index.js'
import 'puppeteer-extra-plugin-stealth/evasions/webgl.vendor/index.js'
import 'puppeteer-extra-plugin-stealth/evasions/window.outerdimensions/index.js'
import 'puppeteer-extra-plugin-stealth/evasions/defaultArgs/index.js'
import 'puppeteer-extra-plugin-user-preferences/index.js'
import 'puppeteer-extra-plugin-user-data-dir/index.js'
import { rm } from 'fs/promises'
import { v4 as uuidv4 } from 'uuid'

export const defaultHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    Connection: 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
}

export async function setupBrowser(): Promise<{ browser: BrowserContext; page: Page }> {
    // Generate unique temp directory for this browser instance
    const tmpDirKey = uuidv4()
    const userDataDir = `/tmp/playwright_${tmpDirKey}`

    try {
        const playwrightChromium = addExtra(pw)
        playwrightChromium.use(
            StealthPlugin({
                enabledEvasions: new Set([
                    'chrome.runtime',
                    'defaultArgs',
                    'iframe.contentWindow',
                    'media.codecs',
                    'navigator.languages',
                    'navigator.permissions',
                    'navigator.plugins',
                    'navigator.vendor',
                    'navigator.webdriver',
                    'sourceurl',
                    'user-agent-override',
                    'webgl.vendor',
                    'window.outerdimensions',
                ]),
            })
        )

        const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_VERSION
        if (isServerless) {
            const executablePath = await chromium.executablePath()

            // Create browser context with persistent storage
            const browser = await playwrightChromium.launchPersistentContext(userDataDir, {
                headless: true,
                executablePath,
                args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
            })

            const page = await browser.newPage()
            await page.setExtraHTTPHeaders(defaultHeaders)

            return {
                browser,
                page,
            }
        } else {
            // Non-serverless setup
            const browser = await playwrightChromium.launchPersistentContext(userDataDir, {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            })

            const page = await browser.newPage()
            await page.setExtraHTTPHeaders(defaultHeaders)

            return {
                browser,
                page,
            }
        }
    } catch (error) {
        // Clean up temp dir if browser launch fails
        try {
            await rm(userDataDir, { recursive: true, force: true })
        } catch (cleanupError) {
            console.log('Cleanup warning:', cleanupError)
        }
        throw error
    }
}
