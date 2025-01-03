import { addImageToS3 } from '../utilities/s3Functions.js';
export async function save(settings, imageFiles) {
    try {
        let uploadedImagesCount = 0;
        let imageList = [];
        console.log('imagefiles length', imageFiles.length);
        for (let i = 0; i < imageFiles.length; i++) {
            const basePath = imageFiles[i].type === 'logo' ? settings.basePath + '/scraped/images/logos' : settings.basePath + '/scraped/images';
            //console.log('uploading image to s3', imageFiles[i].imageFileName)
            if (imageFiles[i].type === 'logo') {
                console.log('we have a logo img', imageFiles[i].imageFileName);
            }
            //may have to change this to hash
            const s3Url = await addImageToS3(imageFiles[i].fileContents, `${basePath}/${imageFiles[i].imageFileName}`);
            //console.log('s3url', s3Url)
            imageList.push({ fileName: s3Url, status: 'uploaded' });
            uploadedImagesCount += 1;
        }
        return { uploadedImages: imageList, imageUploadCount: uploadedImagesCount, failedImageList: [] };
    }
    catch (err) {
        throw 'Error saving to s3: ' + err.message;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiczMtaW1hZ2VzLXVwbG9hZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZXJ2aWNlcy9zMy1pbWFnZXMtdXBsb2FkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQTtBQUUxRCxNQUFNLENBQUMsS0FBSyxVQUFVLElBQUksQ0FBQyxRQUFrQixFQUFFLFVBQXdCO0lBQ25FLElBQUksQ0FBQztRQUNELElBQUksbUJBQW1CLEdBQUcsQ0FBQyxDQUFBO1FBQzNCLElBQUksU0FBUyxHQUFHLEVBQUUsQ0FBQTtRQUNsQixPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixFQUFFLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQTtRQUVuRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3pDLE1BQU0sUUFBUSxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxHQUFHLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxHQUFHLGlCQUFpQixDQUFBO1lBQ3BJLG1FQUFtRTtZQUVuRSxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssTUFBTSxFQUFFLENBQUM7Z0JBQ2hDLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFBO1lBQ2xFLENBQUM7WUFFRCxpQ0FBaUM7WUFDakMsTUFBTSxLQUFLLEdBQUcsTUFBTSxZQUFZLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksRUFBRSxHQUFHLFFBQVEsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQTtZQUMxRyw2QkFBNkI7WUFDN0IsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUE7WUFDdkQsbUJBQW1CLElBQUksQ0FBQyxDQUFBO1FBQzVCLENBQUM7UUFFRCxPQUFPLEVBQUUsY0FBYyxFQUFFLFNBQVMsRUFBRSxnQkFBZ0IsRUFBRSxtQkFBbUIsRUFBRSxlQUFlLEVBQUUsRUFBRSxFQUFFLENBQUE7SUFDcEcsQ0FBQztJQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDWCxNQUFNLHNCQUFzQixHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUE7SUFDOUMsQ0FBQztBQUNMLENBQUMifQ==