import { ScrapingError } from '../utilities/errors.js';
import { save as WriteToFile } from '../services/write-to-folder.js';
import { save as s3FileUpload } from '../services/s3-images-upload.js';
import { save as batchUploadToDuda } from '../services/save-to-duda.js';
import { addFileS3 } from '../utilities/s3Functions.js';
export const save = async (settings, scrapedData) => {
    if (settings.saveImages) {
        let s3SavedRes;
        //save to s3 by default (backupImagesSave defaults to true if not in params)
        if (settings.backupImagesSave || settings.saveMethod === 's3Upload') {
            s3SavedRes = await saveScrapedData({ ...settings, saveMethod: 's3Upload' }, scrapedData.imageFiles, scrapedData.siteData);
        }
        let saveServiceRes;
        if (settings.saveMethod != 's3Upload') {
            saveServiceRes = await saveScrapedData(settings, scrapedData.imageFiles, scrapedData.siteData);
        }
        const savedInfoResponse = saveServiceRes || s3SavedRes;
        return {
            imageUploadTotal: savedInfoResponse?.imageData.imageUploadTotal || 0,
            failedImageCount: savedInfoResponse?.imageData.failedImageList.length || 0,
            uploadedResources: savedInfoResponse?.imageData.uploadedResources || [],
            s3UploadedImages: s3SavedRes?.imageData.uploadedResources || [],
            failedImages: savedInfoResponse?.imageData.failedImageList || [],
            scrapedPages: scrapedData.siteData.pages,
            url: scrapedData.url,
            siteData: scrapedData.siteData,
        };
    }
    else {
        return { message: 'Scrape complete: no images uploaded', scrapedPages: scrapedData.siteData.pages, url: scrapedData.url };
    }
};
export const saveScrapedData = async (settings, imageFiles, siteData) => {
    try {
        const savedImages = await saveScrapedImages(settings, imageFiles);
        await savePageDataToS3(settings, siteData);
        return {
            imageData: {
                uploadedResources: savedImages.uploadedImages,
                imageUploadTotal: savedImages.imageUploadCount,
                failedImageList: savedImages.failedImageList,
            },
        };
    }
    catch (err) {
        throw err;
    }
};
export async function saveScrapedImages(settings, imageFiles) {
    console.log(`${!settings.saveMethod ? 'no save method' : 'save method = ' + settings.saveMethod}`);
    let save;
    switch (settings.saveMethod) {
        case 'writeFolder':
            save = WriteToFile;
            break;
        case 's3Upload':
            save = s3FileUpload;
            break;
        case 'dudaUpload':
            save = batchUploadToDuda;
            break;
        case undefined:
            save = batchUploadToDuda;
            break;
        default:
            save = batchUploadToDuda;
            break;
    }
    const savedInfo = await save(settings, imageFiles);
    return {
        uploadedImages: savedInfo.uploadedImages || [],
        imageUploadCount: savedInfo.imageUploadCount || 0,
        failedImageList: savedInfo.failedImageList,
    };
}
export const savePageDataToS3 = async (settings, scrapedPageData) => {
    try {
        const folderPath = `${settings.basePath}/scraped/siteData`;
        await addFileS3(scrapedPageData, folderPath);
        console.log('scraped page data uploaded to ', folderPath);
    }
    catch (err) {
        throw new ScrapingError({
            domain: settings.url,
            message: `Failed to save scraped site data: ` + err.message,
            state: { scrapeStatus: 'Scraped site data not saved', method: settings.saveMethod },
            errorType: 'SCR-012',
        });
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2F2ZS1zY3JhcGVkLWRhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb3V0cHV0L3NhdmUtc2NyYXBlZC1kYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQTtBQUN0RCxPQUFPLEVBQUUsSUFBSSxJQUFJLFdBQVcsRUFBRSxNQUFNLGdDQUFnQyxDQUFBO0FBQ3BFLE9BQU8sRUFBRSxJQUFJLElBQUksWUFBWSxFQUFFLE1BQU0saUNBQWlDLENBQUE7QUFDdEUsT0FBTyxFQUFFLElBQUksSUFBSSxpQkFBaUIsRUFBRSxNQUFNLDZCQUE2QixDQUFBO0FBQ3ZFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQTtBQXNCdkQsTUFBTSxDQUFDLE1BQU0sSUFBSSxHQUFHLEtBQUssRUFBRSxRQUFrQixFQUFFLFdBQThCLEVBQUUsRUFBRTtJQUM3RSxJQUFJLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUN0QixJQUFJLFVBQVUsQ0FBQTtRQUNkLDRFQUE0RTtRQUM1RSxJQUFJLFFBQVEsQ0FBQyxnQkFBZ0IsSUFBSSxRQUFRLENBQUMsVUFBVSxLQUFLLFVBQVUsRUFBRSxDQUFDO1lBQ2xFLFVBQVUsR0FBRyxNQUFNLGVBQWUsQ0FBQyxFQUFFLEdBQUcsUUFBUSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsRUFBRSxXQUFXLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUM3SCxDQUFDO1FBRUQsSUFBSSxjQUFjLENBQUE7UUFDbEIsSUFBSSxRQUFRLENBQUMsVUFBVSxJQUFJLFVBQVUsRUFBRSxDQUFDO1lBQ3BDLGNBQWMsR0FBRyxNQUFNLGVBQWUsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLFVBQVUsRUFBRSxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDbEcsQ0FBQztRQUNELE1BQU0saUJBQWlC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