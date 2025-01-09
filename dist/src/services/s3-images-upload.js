import { ScrapingError } from '../utilities/errors.js';
import { addImageToS3 } from '../utilities/s3Functions.js';
export async function save(settings, imageFiles, logoUrl) {
    try {
        let uploadedImagesCount = 0;
        let imageList = [];
        console.log('imagefiles length', imageFiles.length);
        let s3LogoUrl = '';
        for (let i = 0; i < imageFiles.length; i++) {
            const basePath = imageFiles[i].type === 'logo' ? settings.basePath + '/scraped/images/logos' : settings.basePath + '/scraped/images';
            let fileName = `${basePath}/${imageFiles[i].imageFileName}`;
            if (imageFiles[i].type === 'logo') {
                console.log('we have a logo img', imageFiles[i].imageFileName);
                fileName = `${basePath}/header-logo${imageFiles[i].fileExtension}`; //need to add ext
            }
            //may have to change this to hash
            const s3Url = await addImageToS3(imageFiles[i].fileContents, fileName);
            if (imageFiles[i].type === 'logo') {
                s3LogoUrl = s3Url;
                console.log('s3url', s3Url);
            }
            imageList.push({ fileName: s3Url, status: 'uploaded' });
            uploadedImagesCount += 1;
        }
        return { uploadedImages: imageList, imageUploadCount: uploadedImagesCount, failedImageList: [], logoUrl: s3LogoUrl };
    }
    catch (err) {
        throw new ScrapingError({
            domain: settings.url,
            message: `Failed to save scraped images to S3: ` + err,
            state: { scrapeStatus: 'Scraped images not saved' },
            errorType: 'SCR-012',
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiczMtaW1hZ2VzLXVwbG9hZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZXJ2aWNlcy9zMy1pbWFnZXMtdXBsb2FkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQTtBQUN0RCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sNkJBQTZCLENBQUE7QUFFMUQsTUFBTSxDQUFDLEtBQUssVUFBVSxJQUFJLENBQUMsUUFBa0IsRUFBRSxVQUF3QixFQUFFLE9BQWdCO0lBQ3JGLElBQUksQ0FBQztRQUNELElBQUksbUJBQW1CLEdBQUcsQ0FBQyxDQUFBO1FBQzNCLElBQUksU0FBUyxHQUFHLEVBQUUsQ0FBQTtRQUNsQixPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixFQUFFLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQTtRQUVuRCxJQUFJLFNBQVMsR0FBRyxFQUFFLENBQUE7UUFDbEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUN6QyxNQUFNLFFBQVEsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsR0FBRyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsR0FBRyxpQkFBaUIsQ0FBQTtZQUNwSSxJQUFJLFFBQVEsR0FBRyxHQUFHLFFBQVEsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUE7WUFFM0QsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLE1BQU0sRUFBRSxDQUFDO2dCQUNoQyxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQixFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQTtnQkFDOUQsUUFBUSxHQUFHLEdBQUcsUUFBUSxlQUFlLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQSxDQUFDLGlCQUFpQjtZQUN4RixDQUFDO1lBRUQsaUNBQWlDO1lBQ2pDLE1BQU0sS0FBSyxHQUFHLE1BQU0sWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLEVBQUUsUUFBUSxDQUFDLENBQUE7WUFDdEUsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLE1BQU0sRUFBRSxDQUFDO2dCQUNoQyxTQUFTLEdBQUcsS0FBSyxDQUFBO2dCQUNqQixPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQTtZQUMvQixDQUFDO1lBQ0QsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUE7WUFDdkQsbUJBQW1CLElBQUksQ0FBQyxDQUFBO1FBQzVCLENBQUM7UUFFRCxPQUFPLEVBQUUsY0FBYyxFQUFFLFNBQVMsRUFBRSxnQkFBZ0IsRUFBRSxtQkFBbUIsRUFBRSxlQUFlLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsQ0FBQTtJQUN4SCxDQUFDO0lBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNYLE1BQU0sSUFBSSxhQUFhLENBQUM7WUFDcEIsTUFBTSxFQUFFLFFBQVEsQ0FBQyxHQUFHO1lBQ3BCLE9BQU8sRUFBRSx1Q0FBdUMsR0FBRyxHQUFHO1lBQ3RELEtBQUssRUFBRSxFQUFFLFlBQVksRUFBRSwwQkFBMEIsRUFBRTtZQUNuRCxTQUFTLEVBQUUsU0FBUztTQUN2QixDQUFDLENBQUE7SUFDTixDQUFDO0FBQ0wsQ0FBQyJ9