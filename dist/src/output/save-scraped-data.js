import { ScrapingError } from '../utilities/errors.js';
import { save as WriteToFile } from '../services/write-to-folder.js';
import { save as s3FileUpload } from '../services/s3-images-upload.js';
import { save as batchUploadToDuda } from '../services/save-to-duda.js';
import { addFileS3 } from '../utilities/s3Functions.js';
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
        throw new ScrapingError({
            domain: settings.url,
            message: `Failed to save scraped data: ` + err.message,
            state: { scrapeStatus: 'Scraped images not saved' },
            errorType: 'SCR-012',
        });
    }
};
export async function saveScrapedImages(settings, imageFiles) {
    try {
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
    catch (err) {
        throw new ScrapingError({
            domain: settings.url,
            message: `Failed to save scraped images: ` + err.message,
            state: { scrapeStatus: 'Scraped images not saved' },
            errorType: 'SCR-012',
        });
    }
}
export const savePageDataToS3 = async (settings, scrapedPageData) => {
    try {
        const folderPath = `${settings.basePath}/scraped/siteData`;
        await addFileS3(scrapedPageData, folderPath);
        console.log('scraped page data uploaded to ', folderPath);
    }
    catch (err) {
        throw err.message;
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2F2ZS1zY3JhcGVkLWRhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb3V0cHV0L3NhdmUtc2NyYXBlZC1kYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQTtBQUN0RCxPQUFPLEVBQUUsSUFBSSxJQUFJLFdBQVcsRUFBRSxNQUFNLGdDQUFnQyxDQUFBO0FBQ3BFLE9BQU8sRUFBRSxJQUFJLElBQUksWUFBWSxFQUFFLE1BQU0saUNBQWlDLENBQUE7QUFDdEUsT0FBTyxFQUFFLElBQUksSUFBSSxpQkFBaUIsRUFBRSxNQUFNLDZCQUE2QixDQUFBO0FBQ3ZFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQTtBQVN2RCxNQUFNLENBQUMsTUFBTSxlQUFlLEdBQUcsS0FBSyxFQUFFLFFBQWtCLEVBQUUsVUFBd0IsRUFBRSxRQUF3QixFQUFFLEVBQUU7SUFDNUcsSUFBSSxDQUFDO1FBQ0QsTUFBTSxXQUFXLEdBQUcsTUFBTSxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUE7UUFDakUsTUFBTSxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUE7UUFFMUMsT0FBTztZQUNILFNBQVMsRUFBRTtnQkFDUCxpQkFBaUIsRUFBRSxXQUFXLENBQUMsY0FBYztnQkFDN0MsZ0JBQWdCLEVBQUUsV0FBVyxDQUFDLGdCQUFnQjtnQkFDOUMsZUFBZSxFQUFFLFdBQVcsQ0FBQyxlQUFlO2FBQy9DO1NBQ0osQ0FBQTtJQUNMLENBQUM7SUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ1gsTUFBTSxJQUFJLGFBQWEsQ0FBQztZQUNwQixNQUFNLEVBQUUsUUFBUSxDQUFDLEdBQUc7WUFDcEIsT0FBTyxFQUFFLCtCQUErQixHQUFHLEdBQUcsQ0FBQyxPQUFPO1lBQ3RELEtBQUssRUFBRSxFQUFFLFlBQVksRUFBRSwwQkFBMEIsRUFBRTtZQUNuRCxTQUFTLEVBQUUsU0FBUztTQUN2QixDQUFDLENBQUE7SUFDTixDQUFDO0FBQ0wsQ0FBQyxDQUFBO0FBRUQsTUFBTSxDQUFDLEtBQUssVUFBVSxpQkFBaUIsQ0FBQyxRQUFrQixFQUFFLFVBQXdCO0lBQ2hGLElBQUksQ0FBQztRQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsR0FBRyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQTtRQUVsRyxJQUFJLElBQTJFLENBQUE7UUFDL0UsUUFBUSxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDMUIsS0FBSyxhQUFhO2dCQUNkLElBQUksR0FBRyxXQUFXLENBQUE7Z0JBQ2xCLE1BQUs7WUFFVCxLQUFLLFVBQVU7Z0JBQ1gsSUFBSSxHQUFHLFlBQVksQ0FBQTtnQkFDbkIsTUFBSztZQUNULEtBQUssWUFBWTtnQkFDYixJQUFJLEdBQUcsaUJBQWlCLENBQUE7Z0JBQ3hCLE1BQUs7WUFFVCxLQUFLLFNBQVM7Z0JBQ1YsSUFBSSxHQUFHLGlCQUFpQixDQUFBO2dCQUN4QixNQUFLO1lBQ1Q7Z0JBQ0ksSUFBSSxHQUFHLGlCQUFpQixDQUFBO2dCQUN4QixNQUFLO1FBQ2IsQ0FBQztRQUVELE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQTtRQUNsRCxPQUFPO1lBQ0gsY0FBYyxFQUFFLFNBQVMsQ0FBQyxjQUFjLElBQUksRUFBRTtZQUM5QyxnQkFBZ0IsRUFBRSxTQUFTLENBQUMsZ0JBQWdCLElBQUksQ0FBQztZQUNqRCxlQUFlLEVBQUUsU0FBUyxDQUFDLGVBQWU7U0FDN0MsQ0FBQTtJQUNMLENBQUM7SUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ1gsTUFBTSxJQUFJLGFBQWEsQ0FBQztZQUNwQixNQUFNLEVBQUUsUUFBUSxDQUFDLEdBQUc7WUFDcEIsT0FBTyxFQUFFLGlDQUFpQyxHQUFHLEdBQUcsQ0FBQyxPQUFPO1lBQ3hELEtBQUssRUFBRSxFQUFFLFlBQVksRUFBRSwwQkFBMEIsRUFBRTtZQUNuRCxTQUFTLEVBQUUsU0FBUztTQUN2QixDQUFDLENBQUE7SUFDTixDQUFDO0FBQ0wsQ0FBQztBQUVELE1BQU0sQ0FBQyxNQUFNLGdCQUFnQixHQUFHLEtBQUssRUFBRSxRQUFrQixFQUFFLGVBQStCLEVBQUUsRUFBRTtJQUMxRixJQUFJLENBQUM7UUFDRCxNQUFNLFVBQVUsR0FBRyxHQUFHLFFBQVEsQ0FBQyxRQUFRLG1CQUFtQixDQUFBO1FBQzFELE1BQU0sU0FBUyxDQUFDLGVBQWUsRUFBRSxVQUFVLENBQUMsQ0FBQTtRQUM1QyxPQUFPLENBQUMsR0FBRyxDQUFDLGdDQUFnQyxFQUFFLFVBQVUsQ0FBQyxDQUFBO0lBQzdELENBQUM7SUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ1gsTUFBTSxHQUFHLENBQUMsT0FBTyxDQUFBO0lBQ3JCLENBQUM7QUFDTCxDQUFDLENBQUEifQ==