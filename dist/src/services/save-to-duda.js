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
                message: 'Failed to upload batch images: ' + error.message,
                state: { scrapeStatus: 'Images not uploaded' },
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
        /*         console.error('duda upload error', error)
        throw 'failed to upload batch images' */
        throw new ScrapingError({
            domain: '',
            message: 'Failed to upload batch images: ' + error.message,
            state: { scrapeStatus: 'Images not uploaded' },
            errorType: 'SCR-012',
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2F2ZS10by1kdWRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3NlcnZpY2VzL3NhdmUtdG8tZHVkYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQTtBQUNoRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sd0JBQXdCLENBQUE7QUF1QnRELE1BQU0sVUFBVSx1QkFBdUIsQ0FBQyxVQUF3QjtJQUM1RCxNQUFNLFFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFBO0lBQ2xDLE1BQU0sYUFBYSxHQUFvQixFQUFFLENBQUE7SUFDekMsTUFBTSxlQUFlLEdBQUcsVUFBVSxDQUFBO0lBRWxDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtRQUN4QixNQUFNLFlBQVksR0FBRyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7UUFFakQsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ2hCLE9BQU8sQ0FBQyxJQUFJLENBQUMsd0JBQXdCLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFBO1lBQ2hELE9BQU07UUFDVixDQUFDO1FBRUQsSUFBSSxRQUFRLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUM7WUFDN0IsT0FBTyxDQUFDLElBQUksQ0FBQywwQkFBMEIsWUFBWSxFQUFFLENBQUMsQ0FBQTtZQUN0RCxPQUFNO1FBQ1YsQ0FBQztRQUVELFFBQVEsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUE7UUFDMUIsYUFBYSxDQUFDLElBQUksQ0FBQztZQUNmLGFBQWEsRUFBRSxPQUFPO1lBQ3RCLEdBQUcsRUFBRSxZQUFZO1lBQ2pCLE1BQU0sRUFBRSxlQUFlO1NBQzFCLENBQUMsQ0FBQTtJQUNOLENBQUMsQ0FBQyxDQUFBO0lBRUYsT0FBTyxhQUFhLENBQUE7QUFDeEIsQ0FBQztBQUVELE1B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