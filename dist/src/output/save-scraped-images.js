import { ScrapingError } from '../utilities/errors.js';
import { addImageToS3 } from '../utilities/s3Functions.js';
import { convertUrlToApexId } from '../utilities/utils.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
export async function saveScrapedImages(settings, imageFiles) {
    try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        for (let i = 0; i < imageFiles.length; i++) {
            // Write the file to the local folder if specified
            if (settings.saveMethod === 'writeFolder') {
                const dirName = convertUrlToApexId(settings.url);
                const storagePath = path.resolve(__dirname, 'scraped-images', dirName);
                fs.mkdirSync(storagePath, { recursive: true });
                const filePath = path.resolve(storagePath, imageFiles[i].hashedFileName);
                const writeStream = fs.createWriteStream(filePath);
                writeStream.write(imageFiles[i].fileContents);
            }
            // Upload the image to S3 if specified
            if (settings.saveMethod === 's3Upload') {
                const basePath = convertUrlToApexId(settings.url) + '/scraped';
                console.log('uploading image to s3', imageFiles[i].hashedFileName);
                await addImageToS3(imageFiles[i].fileContents, `${basePath}/${imageFiles[i].hashedFileName}`);
            }
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2F2ZS1zY3JhcGVkLWltYWdlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vdXRwdXQvc2F2ZS1zY3JhcGVkLWltYWdlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sd0JBQXdCLENBQUE7QUFDdEQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDZCQUE2QixDQUFBO0FBQzFELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHVCQUF1QixDQUFBO0FBQzFELE9BQU8sRUFBRSxNQUFNLElBQUksQ0FBQTtBQUNuQixPQUFPLElBQUksTUFBTSxNQUFNLENBQUE7QUFDdkIsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLEtBQUssQ0FBQTtBQUVuQyxNQUFNLENBQUMsS0FBSyxVQUFVLGlCQUFpQixDQUFDLFFBQWtCLEVBQUUsVUFBOEQ7SUFDdEgsSUFBSSxDQUFDO1FBQ0QsTUFBTSxVQUFVLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQTtRQUMxQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3pDLGtEQUFrRDtZQUNsRCxJQUFJLFFBQVEsQ0FBQyxVQUFVLEtBQUssYUFBYSxFQUFFLENBQUM7Z0JBQ3hDLE1BQU0sT0FBTyxHQUFHLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQTtnQkFDaEQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLENBQUE7Z0JBQ3RFLEVBQUUsQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUE7Z0JBQzlDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQTtnQkFDeEUsTUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFBO2dCQUNsRCxXQUFXLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQTtZQUNqRCxDQUFDO1lBRUQsc0NBQXNDO1lBQ3RDLElBQUksUUFBUSxDQUFDLFVBQVUsS0FBSyxVQUFVLEVBQUUsQ0FBQztnQkFDckMsTUFBTSxRQUFRLEdBQUcsa0JBQWtCLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFVBQVUsQ0FBQTtnQkFDOUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUE7Z0JBQ2xFLE1BQU0sWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLEVBQUUsR0FBRyxRQUFRLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUE7WUFDakcsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNYLE1BQU0sSUFBSSxhQUFhLENBQUM7WUFDcEIsTUFBTSxFQUFFLFFBQVEsQ0FBQyxHQUFHO1lBQ3BCLE9BQU8sRUFBRSxpQ0FBaUMsR0FBRyxHQUFHLENBQUMsT0FBTztZQUN4RCxLQUFLLEVBQUUsRUFBRSxZQUFZLEVBQUUsMEJBQTBCLEVBQUU7WUFDbkQsU0FBUyxFQUFFLFNBQVM7U0FDdkIsQ0FBQyxDQUFBO0lBQ04sQ0FBQztBQUNMLENBQUMifQ==