import { ScrapingError } from '../utilities/errors.js';
import { save as WriteToFile } from '../services/write-to-folder.js';
import { save as s3FileUpload } from '../services/s3-upload.js';
import { save as batchUploadToDuda } from '../services/save-to-duda.js';
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
        //return await save(settings, imageFiles)
        const savedInfo = await save(settings, imageFiles);
        return {
            uploadedResources: savedInfo.uploadedImages || [],
            imageUploadTotal: savedInfo.imageUploadCount || 0,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2F2ZS1zY3JhcGVkLWltYWdlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vdXRwdXQvc2F2ZS1zY3JhcGVkLWltYWdlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sd0JBQXdCLENBQUE7QUFDdEQsT0FBTyxFQUFFLElBQUksSUFBSSxXQUFXLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQTtBQUNwRSxPQUFPLEVBQUUsSUFBSSxJQUFJLFlBQVksRUFBRSxNQUFNLDBCQUEwQixDQUFBO0FBQy9ELE9BQU8sRUFBRSxJQUFJLElBQUksaUJBQWlCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQTtBQVF2RSxNQUFNLENBQUMsS0FBSyxVQUFVLGlCQUFpQixDQUFDLFFBQWtCLEVBQUUsVUFBd0I7SUFDaEYsSUFBSSxDQUFDO1FBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFBO1FBRWxHLElBQUksSUFBMkUsQ0FBQTtRQUMvRSxRQUFRLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUMxQixLQUFLLGFBQWE7Z0JBQ2QsSUFBSSxHQUFHLFdBQVcsQ0FBQTtnQkFDbEIsTUFBSztZQUVULEtBQUssVUFBVTtnQkFDWCxJQUFJLEdBQUcsWUFBWSxDQUFBO2dCQUNuQixNQUFLO1lBQ1QsS0FBSyxZQUFZO2dCQUNiLElBQUksR0FBRyxpQkFBaUIsQ0FBQTtnQkFDeEIsTUFBSztZQUVULEtBQUssU0FBUztnQkFDVixJQUFJLEdBQUcsaUJBQWlCLENBQUE7Z0JBQ3hCLE1BQUs7WUFDVDtnQkFDSSxJQUFJLEdBQUcsaUJBQWlCLENBQUE7Z0JBQ3hCLE1BQUs7UUFDYixDQUFDO1FBRUQseUNBQXlDO1FBQ3pDLE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQTtRQUNsRCxPQUFPO1lBQ0gsaUJBQWlCLEVBQUUsU0FBUyxDQUFDLGNBQWMsSUFBSSxFQUFFO1lBQ2pELGdCQUFnQixFQUFFLFNBQVMsQ0FBQyxnQkFBZ0IsSUFBSSxDQUFDO1lBQ2pELGVBQWUsRUFBRSxTQUFTLENBQUMsZUFBZTtTQUM3QyxDQUFBO0lBQ0wsQ0FBQztJQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDWCxNQUFNLElBQUksYUFBYSxDQUFDO1lBQ3BCLE1BQU0sRUFBRSxRQUFRLENBQUMsR0FBRztZQUNwQixPQUFPLEVBQUUsaUNBQWlDLEdBQUcsR0FBRyxDQUFDLE9BQU87WUFDeEQsS0FBSyxFQUFFLEVBQUUsWUFBWSxFQUFFLDBCQUEwQixFQUFFO1lBQ25ELFNBQVMsRUFBRSxTQUFTO1NBQ3ZCLENBQUMsQ0FBQTtJQUNOLENBQUM7QUFDTCxDQUFDIn0=