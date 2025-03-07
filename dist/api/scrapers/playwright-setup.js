import chromium from '@sparticuz/chromium';
import { addExtra } from 'playwright-extra';
import { chromium as pw } from 'playwright';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
//import { chromium as playwrightChromium } from 'playwright'
//import { chromium as playwrightChromium } from 'playwright-extra'
import 'puppeteer-extra-plugin-stealth/evasions/chrome.app/index.js';
import 'puppeteer-extra-plugin-stealth/evasions/chrome.csi/index.js';
import 'puppeteer-extra-plugin-stealth/evasions/chrome.loadTimes/index.js';
import 'puppeteer-extra-plugin-stealth/evasions/chrome.runtime/index.js';
import 'puppeteer-extra-plugin-stealth/evasions/iframe.contentWindow/index.js';
import 'puppeteer-extra-plugin-stealth/evasions/media.codecs/index.js';
import 'puppeteer-extra-plugin-stealth/evasions/navigator.hardwareConcurrency/index.js';
import 'puppeteer-extra-plugin-stealth/evasions/navigator.languages/index.js';
import 'puppeteer-extra-plugin-stealth/evasions/navigator.permissions/index.js';
import 'puppeteer-extra-plugin-stealth/evasions/navigator.plugins/index.js';
import 'puppeteer-extra-plugin-stealth/evasions/navigator.vendor/index.js';
import 'puppeteer-extra-plugin-stealth/evasions/navigator.webdriver/index.js';
import 'puppeteer-extra-plugin-stealth/evasions/sourceurl/index.js';
import 'puppeteer-extra-plugin-stealth/evasions/user-agent-override/index.js';
import 'puppeteer-extra-plugin-stealth/evasions/webgl.vendor/index.js';
import 'puppeteer-extra-plugin-stealth/evasions/window.outerdimensions/index.js';
import 'puppeteer-extra-plugin-stealth/evasions/defaultArgs/index.js';
import 'puppeteer-extra-plugin-user-preferences/index.js';
import 'puppeteer-extra-plugin-user-data-dir/index.js';
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
};
export async function setupBrowser() {
    const playwrightChromium = addExtra(pw);
    playwrightChromium.use(StealthPlugin({
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
    }));
    const browser = await playwrightChromium.launch({
        headless: false,
        executablePath: process.env.AWS_EXECUTION_ENV ? await chromium.executablePath() : undefined,
        args: [
            ...chromium.args,
            '--no-sandbox',
            '--disable-gpu',
            '--disable-setuid-sandbox',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
            '--disable-site-isolation-trials',
        ],
    });
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders(defaultHeaders);
    return { browser, page };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxheXdyaWdodC1zZXR1cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2FwaS9zY3JhcGVycy9wbGF5d3JpZ2h0LXNldHVwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sUUFBUSxNQUFNLHFCQUFxQixDQUFBO0FBQzFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQTtBQUMzQyxPQUFPLEVBQUUsUUFBUSxJQUFJLEVBQUUsRUFBaUIsTUFBTSxZQUFZLENBQUE7QUFDMUQsT0FBTyxhQUFhLE1BQU0sZ0NBQWdDLENBQUE7QUFDMUQsNkRBQTZEO0FBQzdELG1FQUFtRTtBQUNuRSxPQUFPLDZEQUE2RCxDQUFBO0FBQ3BFLE9BQU8sNkRBQTZELENBQUE7QUFDcEUsT0FBTyxtRUFBbUUsQ0FBQTtBQUMxRSxPQUFPLGlFQUFpRSxDQUFBO0FBQ3hFLE9BQU8sdUVBQXVFLENBQUE7QUFDOUUsT0FBTywrREFBK0QsQ0FBQTtBQUN0RSxPQUFPLGdGQUFnRixDQUFBO0FBQ3ZGLE9BQU8sc0VBQXNFLENBQUE7QUFDN0UsT0FBTyx3RUFBd0UsQ0FBQTtBQUMvRSxPQUFPLG9FQUFvRSxDQUFBO0FBQzNFLE9BQU8sbUVBQW1FLENBQUE7QUFDMUUsT0FBTyxzRUFBc0UsQ0FBQTtBQUM3RSxPQUFPLDREQUE0RCxDQUFBO0FBQ25FLE9BQU8sc0VBQXNFLENBQUE7QUFDN0UsT0FBTywrREFBK0QsQ0FBQTtBQUN0RSxPQUFPLHlFQUF5RSxDQUFBO0FBQ2hGLE9BQU8sOERBQThELENBQUE7QUFDckUsT0FBTyxrREFBa0QsQ0FBQTtBQUN6RCxPQUFPLCtDQUErQyxDQUFBO0FBRXRELE1BQU0sQ0FBQyxNQUFNLGNBQWMsR0FBRztJQUMxQixZQUFZLEVBQUUsaUhBQWlIO0lBQy9ILE1BQU0sRUFBRSw0RUFBNEU7SUFDcEYsaUJBQWlCLEVBQUUsZ0JBQWdCO0lBQ25DLGlCQUFpQixFQUFFLG1CQUFtQjtJQUN0QyxVQUFVLEVBQUUsWUFBWTtJQUN4QiwyQkFBMkIsRUFBRSxHQUFHO0lBQ2hDLGdCQUFnQixFQUFFLFVBQVU7SUFDNUIsZ0JBQWdCLEVBQUUsVUFBVTtJQUM1QixnQkFBZ0IsRUFBRSxNQUFNO0lBQ3hCLGdCQUFnQixFQUFFLElBQUk7Q0FDekIsQ0FBQTtBQUVELE1BQU0sQ0FBQyxLQUFLLFVBQVUsWUFBWTtJQUM5QixNQUFNLGtCQUFrQixHQUFHLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUN2QyxrQkFBa0IsQ0FBQyxHQUFHLENBQ2xCLGFBQWEsQ0FBQztRQUNWLGVBQWUsRUFBRSxJQUFJLEdBQUcsQ0FBQztZQUNyQixnQkFBZ0I7WUFDaEIsYUFBYTtZQUNiLHNCQUFzQjtZQUN0QixjQUFjO1lBQ2QscUJBQXFCO1lBQ3JCLHVCQUF1QjtZQUN2QixtQkFBbUI7WUFDbkIsa0JBQWtCO1lBQ2xCLHFCQUFxQjtZQUNyQixXQUFXO1lBQ1gscUJBQXFCO1lBQ3JCLGNBQWM7WUFDZCx3QkFBd0I7U0FDM0IsQ0FBQztLQUNMLENBQUMsQ0FDTCxDQUFBO0lBRUQsTUFBTSxPQUFPLEdBQUcsTUFBTSxrQkFBa0IsQ0FBQyxNQUFNLENBQUM7UUFDNUMsUUFBUSxFQUFFLEtBQUs7UUFDZixjQUFjLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsTUFBTSxRQUFRLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVM7UUFDM0YsSUFBSSxFQUFFO1lBQ0YsR0FBRyxRQUFRLENBQUMsSUFBSTtZQUNoQixjQUFjO1lBQ2QsZUFBZTtZQUNmLDBCQUEwQjtZQUMxQix3QkFBd0I7WUFDeEIsb0RBQW9EO1lBQ3BELGlDQUFpQztTQUNwQztLQUNKLENBQUMsQ0FBQTtJQUVGLE1BQU0sSUFBSSxHQUFHLE1BQU0sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFBO0lBQ3BDLE1BQU0sSUFBSSxDQUFDLG1CQUFtQixDQUFDLGNBQWMsQ0FBQyxDQUFBO0lBRTlDLE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUE7QUFDNUIsQ0FBQyJ9