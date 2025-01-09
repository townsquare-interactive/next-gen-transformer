import { preprocessImageUrl } from '../../api/scrapers/utils.js';
import { ScrapingError } from '../utilities/errors.js';
export function processImageUrlsForDuda(imageFiles, logoUrl) {
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
    //add logo src seperately from s3 url
    if (logoUrl) {
        processedUrls.push({
            resource_type: 'IMAGE',
            src: logoUrl,
            //folder: 'logos',
            folder: dudaImageFolder,
        });
    }
    return processedUrls;
}
export function processBatch(payload, batchSize) {
    const batches = [];
    for (let i = 0; i < payload.length; i += batchSize) {
        batches.push(payload.slice(i, i + batchSize));
    }
    return batches;
}
export async function save(settings, imageFiles, logoUrl, fetchFunction) {
    const dudaFetchFunction = fetchFunction || dudaFetch;
    const preprocessedPayload = processImageUrlsForDuda(imageFiles, logoUrl);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2F2ZS10by1kdWRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3NlcnZpY2VzL3NhdmUtdG8tZHVkYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQTtBQUNoRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sd0JBQXdCLENBQUE7QUF1QnRELE1BQU0sVUFBVSx1QkFBdUIsQ0FBQyxVQUF3QixFQUFFLE9BQWdCO0lBQzlFLE1BQU0sUUFBUSxHQUFHLElBQUksR0FBRyxFQUFVLENBQUE7SUFDbEMsTUFBTSxhQUFhLEdBQW9CLEVBQUUsQ0FBQTtJQUN6QyxNQUFNLGVBQWUsR0FBRyxVQUFVLENBQUE7SUFFbEMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO1FBQ3hCLE1BQU0sWUFBWSxHQUFHLGtCQUFrQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUVqRCxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDaEIsT0FBTyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUE7WUFDaEQsT0FBTTtRQUNWLENBQUM7UUFFRCxJQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQztZQUM3QixPQUFPLENBQUMsSUFBSSxDQUFDLDBCQUEwQixZQUFZLEVBQUUsQ0FBQyxDQUFBO1lBQ3RELE9BQU07UUFDVixDQUFDO1FBRUQsUUFBUSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQTtRQUMxQixhQUFhLENBQUMsSUFBSSxDQUFDO1lBQ2YsYUFBYSxFQUFFLE9BQU87WUFDdEIsR0FBRyxFQUFFLFlBQVk7WUFDakIsTUFBTSxFQUFFLGVBQWU7U0FDMUIsQ0FBQyxDQUFBO0lBQ04sQ0FBQyxDQUFDLENBQUE7SUFFRixxQ0FBcUM7SUFDckMsSUFBSSxPQUFP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