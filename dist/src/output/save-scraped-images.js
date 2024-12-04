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
        await save(settings, imageFiles);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2F2ZS1zY3JhcGVkLWltYWdlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vdXRwdXQvc2F2ZS1zY3JhcGVkLWltYWdlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sd0JBQXdCLENBQUE7QUFDdEQsT0FBTyxFQUFFLElBQUksSUFBSSxXQUFXLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQTtBQUNwRSxPQUFPLEVBQUUsSUFBSSxJQUFJLFlBQVksRUFBRSxNQUFNLDBCQUEwQixDQUFBO0FBQy9ELE9BQU8sRUFBRSxJQUFJLElBQUksaUJBQWlCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQTtBQUV2RSxNQUFNLENBQUMsS0FBSyxVQUFVLGlCQUFpQixDQUFDLFFBQWtCLEVBQUUsVUFBd0I7SUFDaEYsSUFBSSxDQUFDO1FBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFBO1FBRWxHLElBQUksSUFBSSxDQUFBO1FBQ1IsUUFBUSxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDMUIsS0FBSyxhQUFhO2dCQUNkLElBQUksR0FBRyxXQUFXLENBQUE7Z0JBQ2xCLE1BQUs7WUFFVCxLQUFLLFVBQVU7Z0JBQ1gsSUFBSSxHQUFHLFlBQVksQ0FBQTtnQkFDbkIsTUFBSztZQUNULEtBQUssWUFBWTtnQkFDYixJQUFJLEdBQUcsaUJBQWlCLENBQUE7Z0JBQ3hCLE1BQUs7WUFFVCxLQUFLLFNBQVM7Z0JBQ1YsSUFBSSxHQUFHLGlCQUFpQixDQUFBO2dCQUN4QixNQUFLO1lBQ1Q7Z0JBQ0ksSUFBSSxHQUFHLGlCQUFpQixDQUFBO2dCQUN4QixNQUFLO1FBQ2IsQ0FBQztRQUVELE1BQU0sSUFBSSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQTtJQUNwQyxDQUFDO0lBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNYLE1BQU0sSUFBSSxhQUFhLENBQUM7WUFDcEIsTUFBTSxFQUFFLFFBQVEsQ0FBQyxHQUFHO1lBQ3BCLE9BQU8sRUFBRSxpQ0FBaUMsR0FBRyxHQUFHLENBQUMsT0FBTztZQUN4RCxLQUFLLEVBQUUsRUFBRSxZQUFZLEVBQUUsMEJBQTBCLEVBQUU7WUFDbkQsU0FBUyxFQUFFLFNBQVM7U0FDdkIsQ0FBQyxDQUFBO0lBQ04sQ0FBQztBQUNMLENBQUMifQ==