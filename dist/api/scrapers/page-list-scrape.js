import { chromium as playwrightChromium } from 'playwright';
//sparticuz/chromium package needed to get playwright working correctly on vercel
import chromium from '@sparticuz/chromium';
//const seenImages = new Set<string>()
export async function findPages(settings) {
    try {
        const foundUrls = new Set();
        const browser = await playwrightChromium.launch({
            headless: false,
            executablePath: process.env.AWS_EXECUTION_ENV ? await chromium.executablePath() : undefined,
            args: [...chromium.args, '--no-sandbox', '--disable-gpu', '--disable-setuid-sandbox'],
        });
        const page = await browser.newPage();
        console.log(`Loading main page: ${settings.url}`);
        const response = await page.goto(settings.url, {
            timeout: settings.timeoutLength || 60000,
        });
        if (!response || !response.ok()) {
            console.error(`Failed to load the page: ${settings.url}`);
            await browser.close();
            throw new Error(`Failed to load the page: ${settings.url}`);
        }
        console.log(`Main page loaded successfully: ${settings.url}`);
        // Logic to find links to other pages
        const pageUrls = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('a[href]'));
            return links.map((link) => link.href).filter((href) => href.startsWith('http'));
        });
        for (let x = 0; x < pageUrls.length; x++) {
            const currentUrl = pageUrls[x];
            //remove duplicates
            if (!foundUrls.has(currentUrl) && currentUrl.includes(settings.url)) {
                if (!currentUrl.includes('#')) {
                    foundUrls.add(currentUrl);
                }
            }
        }
        console.log(foundUrls);
        const urlArray = Array.from(foundUrls);
        console.log(`Found ${urlArray.length} pages:`, urlArray);
        await browser.close();
        return urlArray;
    }
    catch (error) {
        throw error.message;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnZS1saXN0LXNjcmFwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2FwaS9zY3JhcGVycy9wYWdlLWxpc3Qtc2NyYXBlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLElBQUksa0JBQWtCLEVBQUUsTUFBTSxZQUFZLENBQUE7QUFDM0QsaUZBQWlGO0FBQ2pGLE9BQU8sUUFBUSxNQUFNLHFCQUFxQixDQUFBO0FBSTFDLHNDQUFzQztBQUN0QyxNQUFNLENBQUMsS0FBSyxVQUFVLFNBQVMsQ0FBQyxRQUFrQjtJQUM5QyxJQUFJLENBQUM7UUFDRCxNQUFNLFNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFBO1FBQ25DLE1BQU0sT0FBTyxHQUFHLE1BQU0sa0JBQWtCLENBQUMsTUFBTSxDQUFDO1lBQzVDLFFBQVEsRUFBRSxLQUFLO1lBQ2YsY0FBYyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLE1BQU0sUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTO1lBQzNGLElBQUksRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUUsZUFBZSxFQUFFLDBCQUEwQixDQUFDO1NBQ3hGLENBQUMsQ0FBQTtRQUVGLE1BQU0sSUFBSSxHQUFHLE1BQU0sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFBO1FBQ3BDLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0JBQXNCLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFBO1FBRWpELE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFO1lBQzNDLE9BQU8sRUFBRSxRQUFRLENBQUMsYUFBYSxJQUFJLEtBQUs7U0FDM0MsQ0FBQyxDQUFBO1FBRUYsSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDO1lBQzlCLE9BQU8sQ0FBQyxLQUFLLENBQUMsNEJBQTRCLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFBO1lBQ3pELE1BQU0sT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFBO1lBQ3JCLE1BQU0sSUFBSSxLQUFLLENBQUMsNEJBQTRCLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFBO1FBQy9ELENBQUM7UUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLGtDQUFrQyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQTtRQUU3RCxxQ0FBcUM7UUFDckMsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRTtZQUN0QyxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFBO1lBQzlELE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQVMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFBO1FBQ3hGLENBQUMsQ0FBQyxDQUFBO1FBRUYsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUN2QyxNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDOUIsbUJBQW1CO1lBQ25CLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ2xFLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7b0JBQzVCLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUE7Z0JBQzdCLENBQUM7WUFDTCxDQUFDO1FBQ0wsQ0FBQztRQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUE7UUFFdEIsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQTtRQUV0QyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsUUFBUSxDQUFDLE1BQU0sU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFBO1FBQ3hELE1BQU0sT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFBO1FBRXJCLE9BQU8sUUFBUSxDQUFBO0lBQ25CLENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2IsTUFBTSxLQUFLLENBQUMsT0FBTyxDQUFBO0lBQ3ZCLENBQUM7QUFDTCxDQUFDIn0=