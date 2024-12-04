import { preprocessImageUrl } from '../../api/scrapers/utils.js'
import { ScrapingError } from '../utilities/errors.js'
export function processImageUrlsForDuda(imageFiles) {
    const seenUrls = new Set()
    const processedUrls = []
    imageFiles.forEach((file) => {
        const processedUrl = preprocessImageUrl(file.url)
        if (!processedUrl) {
            console.warn(`Invalid URL skipped: ${file.url}`)
            return
        }
        if (seenUrls.has(processedUrl)) {
            console.warn(`Duplicate URL skipped: ${processedUrl}`)
            return
        }
        seenUrls.add(processedUrl)
        processedUrls.push({
            resource_type: 'IMAGE',
            src: processedUrl,
            folder: 'Imported',
        })
    })
    return processedUrls
}
export function processBatch(payload, batchSize) {
    const batches = []
    for (let i = 0; i < payload.length; i += batchSize) {
        batches.push(payload.slice(i, i + batchSize))
    }
    return batches
}
export async function save(settings, imageFiles, fetchFunction) {
    const dudaFetchFunction = fetchFunction || dudaFetch
    const preprocessedPayload = processImageUrlsForDuda(imageFiles)
    // Slice preprocessed payload into batches of 10
    const batches = processBatch(preprocessedPayload, 10)
    const batchResults = []
    for (const batch of batches) {
        try {
            const responseData = await dudaFetchFunction(batch, settings)
            batchResults.push(responseData)
        } catch (error) {
            console.error(`Error uploading batch: ${error}`)
            throw new ScrapingError({
                domain: settings.url,
                message: 'Failed to upload batch images: ' + error.message,
                state: { scrapeStatus: 'Images not uploaded' },
                errorType: 'SCR-012',
            })
        }
    }
    console.log('Batch upload results:', batchResults[0]?.uploaded_resources)
    console.log(`Total batches uploaded: ${batchResults.length}`)
    return batchResults
}
async function dudaFetch(payload, settings) {
    const siteName = settings?.uploadLocation || 'c914d96aac4548c2985917d2af88827d'
    const BASE_URL = 'https://api-sandbox.duda.co'
    const dudaApiUrl = `${BASE_URL}/api/sites/multiscreen/resources/${siteName}/upload`
    const DUDA_USERNAME = process.env.DUDA_USERNAME
    const DUDA_PASSWORD = process.env.DUDA_PASSWORD
    try {
        // Encode username and password for Basic Auth
        const authStr = `${DUDA_USERNAME}:${DUDA_PASSWORD}`
        const authB64 = Buffer.from(authStr).toString('base64')
        const HEADERS = {
            Authorization: `Basic ${authB64}`,
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            Connection: 'keep-alive',
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
        }
        const response = await fetch(dudaApiUrl, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify(payload),
        })
        if (!response.ok) {
            console.error(`${response.statusText}`)
            throw 'failed to upload batch images'
        }
        const responseData = await response.json()
        return responseData
    } catch (error) {
        throw 'failed to upload batch images'
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2F2ZS10by1kdWRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3NlcnZpY2VzL3NhdmUtdG8tZHVkYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQTtBQUNoRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sd0JBQXdCLENBQUE7QUFvQnRELE1BQU0sVUFBVSxtQkFBbUIsQ0FBQyxVQUF3QjtJQUN4RCxNQUFNLFFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFBO0lBQ2xDLE1BQU0sYUFBYSxHQUFvQixFQUFFLENBQUE7SUFFekMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO1FBQ3hCLE1BQU0sWUFBWSxHQUFHLGtCQUFrQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUVqRCxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDaEIsT0FBTyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUE7WUFDaEQsT0FBTTtRQUNWLENBQUM7UUFFRCxJQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQztZQUM3QixPQUFPLENBQUMsSUFBSSxDQUFDLDBCQUEwQixZQUFZLEVBQUUsQ0FBQyxDQUFBO1lBQ3RELE9BQU07UUFDVixDQUFDO1FBRUQsUUFBUSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQTtRQUMxQixhQUFhLENBQUMsSUFBSSxDQUFDO1lBQ2YsYUFBYSxFQUFFLE9BQU87WUFDdEIsR0FBRyxFQUFFLFlBQVk7WUFDakIsTUFBTSxFQUFFLFVBQVU7U0FDckIsQ0FBQyxDQUFBO0lBQ04sQ0FBQyxDQUFDLENBQUE7SUFFRixPQUFPLGFBQWEsQ0FBQTtBQUN4QixDQUFDO0FBRUQsTUFBTSxVQUFVLFlBQVksQ0FBQyxPQUF3QixFQUFFLFNB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
