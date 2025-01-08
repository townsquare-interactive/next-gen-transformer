import { preprocessImageUrl } from '../../api/scrapers/utils.js';
import { ScrapingError } from '../utilities/errors.js';
export function processImageUrlsForDuda(imageFiles) {
    const seenUrls = new Set();
    const processedUrls = [];
    const dudaImageFolder = 'Imported';
    imageFiles.forEach((file) => {
        const processedUrl = preprocessImageUrl(file.url);
        if (!processedUrl) {
            console.warn(`Invalid URL skipped: ${file.url}`);
            return;
        }
        if (seenUrls.has(processedUrl)) {
            console.warn(`Duplicate URL skipped: ${processedUrl}`);
            return;
        }
        seenUrls.add(processedUrl);
        processedUrls.push({
            resource_type: 'IMAGE',
            src: processedUrl,
            folder: dudaImageFolder,
        });
    });
    return processedUrls;
}
export function processBatch(payload, batchSize) {
    const batches = [];
    for (let i = 0; i < payload.length; i += batchSize) {
        batches.push(payload.slice(i, i + batchSize));
    }
    return batches;
}
export async function save(settings, imageFiles, fetchFunction) {
    const dudaFetchFunction = fetchFunction || dudaFetch;
    const preprocessedPayload = processImageUrlsForDuda(imageFiles);
    // Slice preprocessed payload into batches of 10
    const batches = processBatch(preprocessedPayload, 10);
    const batchResults = [];
    for (const batch of batches) {
        try {
            const responseData = await dudaFetchFunction(batch, settings);
            batchResults.push(responseData);
        }
        catch (error) {
            console.error(`Error uploading batch: ${error}`);
            throw new ScrapingError({
                domain: settings.url,
                message: 'Failed to upload batch images: ' + error,
                state: { scrapeStatus: 'Images not uploaded', method: settings.saveMethod },
                errorType: 'SCR-012',
            });
        }
    }
    console.log('Batch upload results:', batchResults[0]?.uploaded_resources);
    console.log(`Total batches uploaded: ${batchResults.length}`);
    const allUploads = [];
    let succesfulImageCount = 0;
    let failedImageList = [];
    batchResults.forEach((result) => {
        result.uploaded_resources.forEach((batch) => {
            if (batch.status === 'UPLOADED') {
                succesfulImageCount += 1;
            }
            if (batch.status === 'NOT_FOUND') {
                failedImageList.push(batch.original_url);
            }
            allUploads.push(batch);
        });
    });
    return { uploadedImages: allUploads, imageUploadCount: succesfulImageCount, failedImageList: failedImageList };
}
async function dudaFetch(payload, settings) {
    const siteName = settings?.uploadLocation || 'c914d96aac4548c2985917d2af88827d';
    const BASE_URL = 'https://api-sandbox.duda.co';
    const dudaApiUrl = `${BASE_URL}/api/sites/multiscreen/resources/${siteName}/upload`;
    const DUDA_USERNAME = process.env.DUDA_USERNAME;
    const DUDA_PASSWORD = process.env.DUDA_PASSWORD;
    try {
        // Encode username and password for Basic Auth
        const authStr = `${DUDA_USERNAME}:${DUDA_PASSWORD}`;
        const authB64 = Buffer.from(authStr).toString('base64');
        const HEADERS = {
            Authorization: `Basic ${authB64}`,
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            Connection: 'keep-alive',
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
        };
        const response = await fetch(dudaApiUrl, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            console.error(`status text: ${response.statusText}`);
            throw response.statusText;
        }
        const responseData = await response.json();
        return responseData;
    }
    catch (error) {
        throw error;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2F2ZS10by1kdWRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3NlcnZpY2VzL3NhdmUtdG8tZHVkYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQTtBQUNoRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sd0JBQXdCLENBQUE7QUF1QnRELE1BQU0sVUFBVSx1QkFBdUIsQ0FBQyxVQUF3QjtJQUM1RCxNQUFNLFFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFBO0lBQ2xDLE1BQU0sYUFBYSxHQUFvQixFQUFFLENBQUE7SUFDekMsTUFBTSxlQUFlLEdBQUcsVUFBVSxDQUFBO0lBRWxDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtRQUN4QixNQUFNLFlBQVksR0FBRyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7UUFFakQsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ2hCLE9BQU8sQ0FBQyxJQUFJLENBQUMsd0JBQXdCLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFBO1lBQ2hELE9BQU07UUFDVixDQUFDO1FBRUQsSUFBSSxRQUFRLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUM7WUFDN0IsT0FBTyxDQUFDLElBQUksQ0FBQywwQkFBMEIsWUFBWSxFQUFFLENBQUMsQ0FBQTtZQUN0RCxPQUFNO1FBQ1YsQ0FBQztRQUVELFFBQVEsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUE7UUFDMUIsYUFBYSxDQUFDLElBQUksQ0FBQztZQUNmLGFBQWEsRUFBRSxPQUFPO1lBQ3RCLEdBQUcsRUFBRSxZQUFZO1lBQ2pCLE1BQU0sRUFBRSxlQUFlO1NBQzFCLENBQUMsQ0FBQTtJQUNOLENBQUMsQ0FBQyxDQUFBO0lBRUYsT0FBTyxhQUFhLENBQUE7QUFDeEIsQ0FBQztBQUVELE1B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