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
    //const uploadedImages: UploadedResources[][] = []
    const allUploads = [];
    let succesfulImageCount = 0;
    //let failedImageCount = 0
    let failedImageList = [];
    batchResults.forEach((result) => {
        //uploadedImages.push(result.uploaded_resources)
        result.uploaded_resources.forEach((batch) => {
            // batch.forEach((imageResult) => {
            if (batch.status === 'UPLOADED') {
                succesfulImageCount += 1;
            }
            if (batch.status === 'NOT_FOUND') {
                //failedImageCount += 1
                failedImageList.push(batch.original_url);
            }
            allUploads.push(batch);
            //})
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
            throw 'failed to receive 200 response from image upload';
        }
        const responseData = await response.json();
        return responseData;
    }
    catch (error) {
        console.error('duda upload error', error);
        throw 'failed to upload batch images';
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2F2ZS10by1kdWRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3NlcnZpY2VzL3NhdmUtdG8tZHVkYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQTtBQUNoRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sd0JBQXdCLENBQUE7QUF5QnRELE1BQU0sVUFBVSx1QkFBdUIsQ0FBQyxVQUF3QjtJQUM1RCxNQUFNLFFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFBO0lBQ2xDLE1BQU0sYUFBYSxHQUFvQixFQUFFLENBQUE7SUFDekMsTUFBTSxlQUFlLEdBQUcsVUFBVSxDQUFBO0lBRWxDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtRQUN4QixNQUFNLFlBQVksR0FBRyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7UUFFakQsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ2hCLE9BQU8sQ0FBQyxJQUFJLENBQUMsd0JBQXdCLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFBO1lBQ2hELE9BQU07UUFDVixDQUFDO1FBRUQsSUFBSSxRQUFRLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUM7WUFDN0IsT0FBTyxDQUFDLElBQUksQ0FBQywwQkFBMEIsWUFBWSxFQUFFLENBQUMsQ0FBQTtZQUN0RCxPQUFNO1FBQ1YsQ0FBQztRQUVELFFBQVEsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUE7UUFDMUIsYUFBYSxDQUFDLElBQUksQ0FBQztZQUNmLGFBQWEsRUFBRSxPQUFPO1lBQ3RCLEdBQUcsRUFBRSxZQUFZO1lBQ2pCLE1BQU0sRUFBRSxlQUFlO1NBQzFCLENBQUMsQ0FBQTtJQUNOLENBQUMsQ0FBQyxDQUFBO0lBRUYsT0FBTyxhQUFhLENBQUE7QUFDeEIsQ0FBQztBQUVELE1B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