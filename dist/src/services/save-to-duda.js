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
    if (!settings.uploadLocation) {
        console.log('no upload location for Duda');
        throw new ScrapingError({
            domain: settings.url,
            message: 'Failed to upload images to Duda, no uploadLocation found',
            state: { scrapeStatus: 'Images not uploaded', method: settings.saveMethod },
            errorType: 'SCR-012',
        });
    }
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
    //https://developer.duda.co/reference/site-content-upload-resources
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2F2ZS10by1kdWRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3NlcnZpY2VzL3NhdmUtdG8tZHVkYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQTtBQUNoRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sd0JBQXdCLENBQUE7QUF1QnRELE1BQU0sVUFBVSx1QkFBdUIsQ0FBQyxVQUF3QixFQUFFLE9BQWdCO0lBQzlFLE1BQU0sUUFBUSxHQUFHLElBQUksR0FBRyxFQUFVLENBQUE7SUFDbEMsTUFBTSxhQUFhLEdBQW9CLEVBQUUsQ0FBQTtJQUN6QyxNQUFNLGVBQWUsR0FBRyxVQUFVLENBQUE7SUFFbEMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO1FBQ3hCLE1BQU0sWUFBWSxHQUFHLGtCQUFrQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUVqRCxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDaEIsT0FBTyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUE7WUFDaEQsT0FBTTtRQUNWLENBQUM7UUFFRCxJQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQztZQUM3QixPQUFPLENBQUMsSUFBSSxDQUFDLDBCQUEwQixZQUFZLEVBQUUsQ0FBQyxDQUFBO1lBQ3RELE9BQU07UUFDVixDQUFDO1FBRUQsUUFBUSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQTtRQUMxQixhQUFhLENBQUMsSUFBSSxDQUFDO1lBQ2YsYUFBYSxFQUFFLE9BQU87WUFDdEIsR0FBRyxFQUFFLFlBQVk7WUFDakIsTUFBTSxFQUFFLGVBQWU7U0FDMUIsQ0FBQyxDQUFBO0lBQ04sQ0FBQyxDQUFDLENBQUE7SUFFRixxQ0FBcUM7SUFDckMsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUNWLGFBQWEsQ0FBQyxJQUFJLENBQUM7WUFDZixhQUFhLEVBQUUsT0FBTztZQUN0QixHQUFHLEVBQUUsT0FBTztZQUNaLGtCQUFrQjtZQUNsQixNQUFNLEVBQUUsZUFBZTtTQUMxQixDQUFDLENBQUE7SUFDTixDQUFDO0lBRUQsT0FBTyxhQUFhLENBQUE7QUFDeEIsQ0FBQztBQUVELE1BQU0sVUFBVSxZQUFZLENBQUMsT0FBd0IsRUFBRSxTQUFpQjtJQUNwRSxNQUFNLE9BQU8sR0FBc0IsRUFBRSxDQUFBO0lBQ3JDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxTQUFTLEVBQUUsQ0FBQztRQUNqRCxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFBO0lBQ2pELENBQUM7SUFDRCxPQUFPLE9BQU8sQ0FBQTtBQUNsQixDQUFDO0FBRUQsTUFBTSxDQUFDLEtBQUssVUFBVSxJQUFJLENBQ3RCLFFBQWtCLEVBQ2xCLFVBQXdCLEVBQ3hCLE9BQWdCLEVBQ2hCLGFBQTBEO0lBRTFELElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDM0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFBO1FBQzFDLE1BQU0sSUFBSSxhQUFhLENBQUM7WUFDcEIsTUFBTSxFQUFFLFFBQVEsQ0FBQyxHQUFHO1lBQ3BCLE9BQU8sRUFBRSwwREFBMEQ7WUFDbkUsS0FBSyxFQUFFLEVBQUUsWUFBWSxFQUFFLHFCQUFxQixFQUFFLE1BQU0sRUFBRSxRQUFRLENBQUMsVUFBVSxFQUFFO1lBQzNFLFNBQVMsRUFBRSxTQUFTO1NBQ3ZCLENBQUMsQ0FBQTtJQUNOLENBQUM7SUFFRCxNQUFNLGlCQUFpQixHQUFHLGFBQWEsSUFBSSxTQUFTLENBQUE7SUFDcEQsTUFBTSxtQkFBbUIsR0FBRyx1QkFBdUIsQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUE7SUFFeEUsZ0RBQWdEO0lBQ2hELE1BQU0sT0FBTyxHQUFHLFlBQVksQ0FBQyxtQkFBbUIsRUFBRSxFQUFFLENBQUMsQ0FBQTtJQUNyRCxNQUFNLFlBQVksR0FBbUIsRUFBRSxDQUFBO0lBRXZDLEtBQUssTUFBTSxLQUFLLElBQUksT0FBTyxFQUFFLENBQUM7UUFDMUIsSUFBSSxDQUFDO1lBQ0QsTUFBTSxZQUFZLEdBQUcsTUFBTSxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUE7WUFDN0QsWUFBWSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQTtRQUNuQyxDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNiLE9BQU8sQ0FBQyxLQUFLLENBQUMsMEJBQTBCLEtBQUssRUFBRSxDQUFDLENBQUE7WUFDaEQsTUFBTSxJQUFJLGFBQWEsQ0FBQztnQkFDcEIsTUFBTSxFQUFFLFFBQVEsQ0FBQyxHQUFHO2dCQUNwQixPQUFPLEVBQUUsaUNBQWlDLEdBQUcsS0FBSztnQkFDbEQsS0FBSyxFQUFFLEVBQUUsWUFBWSxFQUFFLHFCQUFxQixFQUFFLE1BQU0sRUFBRSxRQUFRLENBQUMsVUFBVSxFQUFFO2dCQUMzRSxTQUFTLEVBQUUsU0FBUzthQUN2QixDQUFDLENBQUE7UUFDTixDQUFDO0lBQ0wsQ0FBQztJQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFLGtCQUFrQixDQUFDLENBQUE7SUFDekUsT0FBTyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUE7SUFFN0QsTUFBTSxVQUFVLEdBQTJCLEVBQUUsQ0FBQTtJQUM3QyxJQUFJLG1CQUFtQixHQUFHLENBQUMsQ0FBQTtJQUMzQixJQUFJLGVBQWUsR0FBYSxFQUFFLENBQUE7SUFDbEMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO1FBQzVCLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUN4QyxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssVUFBVSxFQUFFLENBQUM7Z0JBQzlCLG1CQUFtQixJQUFJLENBQUMsQ0FBQTtZQUM1QixDQUFDO1lBQ0QsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLFdBQVcsRUFBRSxDQUFDO2dCQUMvQixlQUFlLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQTtZQUM1QyxDQUFDO1lBRUQsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUMxQixDQUFDLENBQUMsQ0FBQTtJQUNOLENBQUMsQ0FBQyxDQUFBO0lBRUYsT0FBTyxFQUFFLGNBQWMsRUFBRSxVQUFVLEVBQUUsZ0JBQWdCLEVBQUUsbUJBQW1CLEVBQUUsZUFBZSxFQUFFLGVBQWUsRUFBRSxDQUFBO0FBQ2xILENBQUM7QUFFRCxLQUFLLFVBQVUsU0FBUyxDQUFDLE9BQXdCLEVBQUUsUUFBbUI7SUFDbEUsTUFBTSxRQUFRLEdBQUcsUUFBUSxFQUFFLGNBQWMsSUFBSSxrQ0FBa0MsQ0FBQTtJQUMvRSxNQUFNLFFBQVEsR0FBRyw2QkFBNkIsQ0FBQTtJQUM5QyxtRUFBbUU7SUFDbkUsTUFBTSxVQUFVLEdBQUcsR0FBRyxRQUFRLG9DQUFvQyxRQUFRLFNBQVMsQ0FBQTtJQUNuRixNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQTtJQUMvQyxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQTtJQUUvQyxJQUFJLENBQUM7UUFDRCw4Q0FBOEM7UUFDOUMsTUFBTSxPQUFPLEdBQUcsR0FBRyxhQUFhLElBQUksYUFBYSxFQUFFLENBQUE7UUFDbkQsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDdkQsTUFBTSxPQUFPLEdBQUc7WUFDWixhQUFhLEVBQUUsU0FBUyxPQUFPLEVBQUU7WUFDakMsY0FBYyxFQUFFLGtCQUFrQjtZQUNsQyxZQUFZLEVBQUUscUhBQXFIO1lBQ25JLE1BQU0sRUFBRSw0RUFBNEU7WUFDcEYsaUJBQWlCLEVBQUUsZ0JBQWdCO1lBQ25DLFVBQVUsRUFBRSxZQUFZO1lBQ3hCLGVBQWUsRUFBRSxVQUFVO1lBQzNCLE1BQU0sRUFBRSxVQUFVO1NBQ3JCLENBQUE7UUFFRCxNQUFNLFFBQVEsR0FBRyxNQUFNLEtBQUssQ0FBQyxVQUFVLEVBQUU7WUFDckMsTUFBTSxFQUFFLE1BQU07WUFDZCxPQUFPLEVBQUUsT0FBTztZQUNoQixJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUM7U0FDaEMsQ0FBQyxDQUFBO1FBRUYsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFBO1lBQ3BELE1BQU0sUUFBUSxDQUFDLFVBQVUsQ0FBQTtRQUM3QixDQUFDO1FBRUQsTUFBTSxZQUFZLEdBQWlCLE1BQU0sUUFBUSxDQUFDLElBQUksRUFBRSxDQUFBO1FBQ3hELE9BQU8sWUFBWSxDQUFBO0lBQ3ZCLENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2IsTUFBTSxLQUFLLENBQUE7SUFDZixDQUFDO0FBQ0wsQ0FBQyJ9