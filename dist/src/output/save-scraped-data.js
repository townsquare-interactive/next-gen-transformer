import { save as WriteToFile } from '../services/write-to-folder.js'
import { save as s3FileUpload } from '../services/s3-images-upload.js'
import { save as batchUploadToDuda } from '../services/save-to-duda.js'
import { addFileS3 } from '../utilities/s3Functions.js'

export const save = async (settings, scrapedData) => {
    if (settings.saveImages) {
        let s3SavedRes
        //save to s3 by default (backupImagesSave defaults to true if not in params)
        if (settings.backupImagesSave) {
            s3SavedRes = await saveScrapedData({ ...settings, saveMethod: 's3Upload' }, scrapedData.imageFiles, scrapedData.siteData)
        }
        const saveServiceRes = await saveScrapedData(settings, scrapedData.imageFiles, scrapedData.siteData)
        const savedInfoResponse = saveServiceRes || s3SavedRes
        return {
            imageUploadTotal: savedInfoResponse?.imageData.imageUploadTotal,
            failedImageCount: savedInfoResponse.imageData.failedImageList.length,
            uploadedResources: savedInfoResponse.imageData.uploadedResources,
            s3UploadedImages: s3SavedRes?.imageData.uploadedResources || [],
            failedImages: savedInfoResponse.imageData.failedImageList,
            scrapedPages: scrapedData.siteData.pages,
            url: scrapedData.url,
            siteData: scrapedData.siteData,
        }
    } else {
        return { message: 'Scrape complete: no images uploaded', scrapedPages: scrapedData.siteData.pages, url: scrapedData.url }
    }
}
export const saveScrapedData = async (settings, imageFiles, siteData) => {
    try {
        const savedImages = await saveScrapedImages(settings, imageFiles)
        await savePageDataToS3(settings, siteData)
        return {
            imageData: {
                uploadedResources: savedImages.uploadedImages,
                imageUploadTotal: savedImages.imageUploadCount,
                failedImageList: savedImages.failedImageList,
            },
        }
    } catch (err) {
        /*         throw new ScrapingError({
            domain: settings.url,
            message: `Failed to save scraped data: ` + err.message,
            state: { scrapeStatus: 'Scraped images not saved' },
            errorType: 'SCR-012',
        }) */
        throw err
    }
}
export async function saveScrapedImages(settings, imageFiles) {
    // try {
    console.log(`${!settings.saveMethod ? 'no save method' : 'save method = ' + settings.saveMethod}`)
    let save
    switch (settings.saveMethod) {
        case 'writeFolder':
            save = WriteToFile
            break
        case 's3Upload':
            save = s3FileUpload
            break
        case 'dudaUpload':
            save = batchUploadToDuda
            break
        case undefined:
            save = batchUploadToDuda
            break
        default:
            save = batchUploadToDuda
            break
    }
    const savedInfo = await save(settings, imageFiles)
    return {
        uploadedImages: savedInfo.uploadedImages || [],
        imageUploadCount: savedInfo.imageUploadCount || 0,
        failedImageList: savedInfo.failedImageList,
    }
    /*  } catch (err) {
        throw new ScrapingError({
            domain: settings.url,
            message: `Failed to save scraped images: ` + err.message,
            state: { scrapeStatus: 'Scraped images not saved' },
            errorType: 'SCR-012',
        })
    } */
}
export const savePageDataToS3 = async (settings, scrapedPageData) => {
    try {
        const folderPath = `${settings.basePath}/scraped/siteData`
        await addFileS3(scrapedPageData, folderPath)
        console.log('scraped page data uploaded to ', folderPath)
    } catch (err) {
        throw err.message
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2F2ZS1zY3JhcGVkLWRhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb3V0cHV0L3NhdmUtc2NyYXBlZC1kYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sRUFBRSxJQUFJLElBQUksV0FBVyxFQUFFLE1BQU0sZ0NBQWdDLENBQUE7QUFDcEUsT0FBTyxFQUFFLElBQUksSUFBSSxZQUFZLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQTtBQUN0RSxPQUFPLEVBQUUsSUFBSSxJQUFJLGlCQUFpQixFQUFFLE1BQU0sNkJBQTZCLENBQUE7QUFDdkUsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLDZCQUE2QixDQUFBO0FBc0J2RCxNQUFNLENBQUMsTUFBTSxJQUFJLEdBQUcsS0FBSyxFQUFFLFFBQWtCLEVBQUUsV0FBOEIsRUFBRSxFQUFFO0lBQzdFLElBQUksUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3RCLElBQUksVUFBVSxDQUFBO1FBQ2QsNEVBQTRFO1FBQzVFLElBQUksUUFBUSxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDNUIsVUFBVSxHQUFHLE1BQU0sZUFBZSxDQUFDLEVBQUUsR0FBRyxRQUFRLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxFQUFFLFdBQVcsQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQzdILENBQUM7UUFFRCxNQUFNLGNBQWMsR0FBRyxNQUFNLGVBQWUsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLFVBQVUsRUFBRSxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDcEcsTUFBTSxpQkFBaUIsR0FBRyxjQUFjLElBQUksVUFBVSxDQUFBO1FBRXRELE9BQU87WUFDSCxnQkFBZ0IsRUFBRSxpQkFBaUIsRUFBRSxTQUFTLENBQUMsZ0JBQWdCO1lBQy9ELGdCQUFnQixFQUFFLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsTUFBTTtZQUNwRSxp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
