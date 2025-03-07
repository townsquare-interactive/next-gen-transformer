import { setupBrowser } from './playwright-setup.js';
export async function findPages(settings) {
    try {
        const foundUrls = new Set();
        const { browser, page } = await setupBrowser();
        console.log(`Loading main page: ${settings.url}`);
        const response = await page.goto(settings.url, {
            timeout: settings.timeoutLength || 60000,
            //waitUntil: 'networkidle', // Wait until network is idle
        });
        if (!response || !response.ok()) {
            console.error(`Failed to load the page: ${settings.url}`);
            if (response) {
                console.error(`Response status: ${response.status()}`);
                console.error(`Response headers:`, response.headers());
                console.error(`Response body:`, await response.text().catch(() => '[Unable to read body]'));
            }
            else {
                console.error(`Response object is null/undefined`);
            }
            await browser.close();
            throw new Error(`Failed to load the page: ${settings.url}`);
        }
        // Wait a moment for any security challenges to complete
        await page.waitForTimeout(5000);
        // Check if we're still on a challenge page
        const pageTitle = await page.title();
        if (pageTitle.includes('Just a moment')) {
            console.log('Detected Cloudflare challenge page, waiting longer...');
            await page.waitForTimeout(10000);
        }
        console.log('Page loaded, proceeding with scrape...');
        // Logic to find links to other pages
        const pageUrls = await page.evaluate(() => {
            const navExists = document.querySelector('nav') !== null;
            const links = Array.from(navExists ? document.querySelectorAll('nav a[href]') : document.querySelectorAll('a[href]'));
            return links
                .map((link) => link.href)
                .filter((href) => {
                return (href.startsWith('http') && !href.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) // Exclude image links
                );
            });
        });
        foundUrls.add(settings.url);
        for (let x = 0; x < pageUrls.length; x++) {
            const currentUrl = pageUrls[x];
            if (!foundUrls.has(currentUrl) && urlsMatch(settings.url, currentUrl)) {
                if (!currentUrl.includes('#')) {
                    foundUrls.add(currentUrl);
                }
            }
        }
        const urlArray = Array.from(foundUrls);
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
        console.log(`Found ${urlArray.length} pages:`, urlArray);
        await browser.close();
        return urlArray;
    }
    catch (error) {
        throw error;
    }
}
//make sure the URLs are not the same with www. or without
function urlsMatch(baseUrl, testUrl) {
    const base = new URL(baseUrl);
    const test = new URL(testUrl);
    return base.hostname === test.hostname || base.hostname.replace(/^www\./, '') === test.hostname.replace(/^www\./, '');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnZS1saXN0LXNjcmFwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2FwaS9zY3JhcGVycy9wYWdlLWxpc3Qtc2NyYXBlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQTtBQUVwRCxNQUFNLENBQUMsS0FBSyxVQUFVLFNBQVMsQ0FBQyxRQUFrQjtJQUM5QyxJQUFJLENBQUM7UUFDRCxNQUFNLFNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFBO1FBQ25DLE1BQU0sRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEdBQUcsTUFBTSxZQUFZLEVBQUUsQ0FBQTtRQUM5QyxPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQTtRQUVqRCxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRTtZQUMzQyxPQUFPLEVBQUUsUUFBUSxDQUFDLGFBQWEsSUFBSSxLQUFLO1lBQ3hDLHlEQUF5RDtTQUM1RCxDQUFDLENBQUE7UUFFRixJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUM7WUFDOUIsT0FBTyxDQUFDLEtBQUssQ0FBQyw0QkFBNEIsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUE7WUFDekQsSUFBSSxRQUFRLEVBQUUsQ0FBQztnQkFDWCxPQUFPLENBQUMsS0FBSyxDQUFDLG9CQUFvQixRQUFRLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFBO2dCQUN0RCxPQUFPLENBQUMsS0FBSyxDQUFDLG1CQUFtQixFQUFFLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFBO2dCQUN0RCxPQUFPLENBQUMsS0FBSyxDQUFDLGdCQUFnQixFQUFFLE1BQU0sUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUE7WUFDL0YsQ0FBQztpQkFBTSxDQUFDO2dCQUNKLE9BQU8sQ0FBQyxLQUFLLENBQUMsbUNBQW1DLENBQUMsQ0FBQTtZQUN0RCxDQUFDO1lBQ0QsTUFBTSxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUE7WUFDckIsTUFBTSxJQUFJLEtBQUssQ0FBQyw0QkFBNEIsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUE7UUFDL0QsQ0FBQztRQUVELHdEQUF3RDtRQUN4RCxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUE7UUFFL0IsMkNBQTJDO1FBQzNDLE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFBO1FBQ3BDLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDO1lBQ3RDLE9BQU8sQ0FBQyxHQUFHLENBQUMsdURBQXVELENBQUMsQ0FBQTtZQUNwRSxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDcEMsQ0FBQztRQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsd0NBQXdDLENBQUMsQ0FBQTtRQUVyRCxxQ0FBcUM7UUFDckMsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRTtZQUN0QyxNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxLQUFLLElBQUksQ0FBQTtZQUN4RCxNQUFNLEtBQUssR0FBd0IsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUE7WUFDMUksT0FBTyxLQUFLO2lCQUNQLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztpQkFDeEIsTUFBTSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7Z0JBQ2IsT0FBTyxDQUNILElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGlDQUFpQyxDQUFDLENBQUMsc0JBQXNCO2lCQUNuRyxDQUFBO1lBQ0wsQ0FBQyxDQUFDLENBQUE7UUFDVixDQUFDLENBQUMsQ0FBQTtRQUVGLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQzNCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDdkMsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBRTlCLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLFVBQVUsQ0FBQyxFQUFFLENBQUM7Z0JBQ3BFLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7b0JBQzVCLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUE7Z0JBQzdCLENBQUM7WUFDTCxDQUFDO1FBQ0wsQ0FBQztRQUVELE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7UUFFdEMsNERBQTREO1FBQzVEOzs7Ozs7O1lBT0k7UUFDSixrRkFBa0Y7UUFFbEYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLFFBQVEsQ0FBQyxNQUFNLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQTtRQUN4RCxNQUFNLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQTtRQUVyQixPQUFPLFFBQVEsQ0FBQTtJQUNuQixDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNiLE1BQU0sS0FBSyxDQUFBO0lBQ2YsQ0FBQztBQUNMLENBQUM7QUFFRCwwREFBMEQ7QUFDMUQsU0FBUyxTQUFTLENBQUMsT0FBZSxFQUFFLE9BQWU7SUFDL0MsTUFBTSxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUE7SUFDN0IsTUFBTSxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUE7SUFFN0IsT0FBTyxJQUFJLENBQUMsUUFBUSxLQUFLLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxLQUFLLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQTtBQUN6SCxDQUFDIn0=