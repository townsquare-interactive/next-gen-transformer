import { ScrapingError } from '../utilities/errors.js'
import { save as WriteToFile } from '../services/write-to-folder.js'
import { save as s3FileUpload } from '../services/s3-images-upload.js'
import { save as batchUploadToDuda } from '../services/save-to-duda.js'
import { addFileS3 } from '../utilities/s3Functions.js'
export const save = async (settings, scrapedData) => {
    if (settings.saveImages) {
        let s3SavedRes
        //save to s3 by default (backupImagesSave defaults to true if not in params)
        if (settings.backupImagesSave || settings.saveMethod === 's3Upload') {
            s3SavedRes = await saveScrapedData({ ...settings, saveMethod: 's3Upload' }, scrapedData.imageFiles, scrapedData.siteData)
        }
        let saveServiceRes
        if (settings.saveMethod != 's3Upload') {
            saveServiceRes = await saveScrapedData(settings, scrapedData.imageFiles, scrapedData.siteData, s3SavedRes?.imageData?.logoUrl || '')
        }
        const savedInfoResponse = saveServiceRes || s3SavedRes
        return {
            imageUploadTotal: savedInfoResponse?.imageData.imageUploadTotal || 0,
            failedImageCount: savedInfoResponse?.imageData.failedImageList.length || 0,
            uploadedResources: savedInfoResponse?.imageData.uploadedResources || [],
            s3UploadedImages: s3SavedRes?.imageData.uploadedResources || [],
            failedImages: savedInfoResponse?.imageData.failedImageList || [],
            s3LogoUrl: s3SavedRes?.imageData?.logoUrl || '',
            scrapedPages: scrapedData.siteData.pages,
            url: scrapedData.url,
            siteData: scrapedData.siteData,
        }
    } else {
        return { message: 'Scrape complete: no images uploaded', scrapedPages: scrapedData.siteData.pages, url: scrapedData.url }
    }
}
export const saveScrapedData = async (settings, imageFiles, siteData, logoUrl) => {
    try {
        const savedImages = await saveScrapedImages(settings, imageFiles, logoUrl)
        await savePageDataToS3(settings, { ...siteData, s3LogoUrl: savedImages.logoUrl || '' })
        return {
            imageData: {
                uploadedResources: savedImages.uploadedImages,
                imageUploadTotal: savedImages.imageUploadCount,
                failedImageList: savedImages.failedImageList,
                logoUrl: savedImages.logoUrl || '',
            },
        }
    } catch (err) {
        throw err
    }
}
export async function saveScrapedImages(settings, imageFiles, logoUrl) {
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
    const savedInfo = await save(settings, imageFiles, logoUrl)
    return {
        uploadedImages: savedInfo.uploadedImages || [],
        imageUploadCount: savedInfo.imageUploadCount || 0,
        failedImageList: savedInfo.failedImageList,
        logoUrl: savedInfo.logoUrl || '',
    }
}
export const savePageDataToS3 = async (settings, scrapedPageData) => {
    try {
        const folderPath = `${settings.basePath}/scraped/siteData`
        await addFileS3(scrapedPageData, folderPath)
        console.log('scraped page data uploaded to ', folderPath)
    } catch (err) {
        throw new ScrapingError({
            domain: settings.url,
            message: `Failed to save scraped site data: ` + err.message,
            state: { scrapeStatus: 'Scraped site data not saved', method: settings.saveMethod },
            errorType: 'SCR-012',
        })
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2F2ZS1zY3JhcGVkLWRhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb3V0cHV0L3NhdmUtc2NyYXBlZC1kYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQTtBQUN0RCxPQUFPLEVBQUUsSUFBSSxJQUFJLFdBQVcsRUFBRSxNQUFNLGdDQUFnQyxDQUFBO0FBQ3BFLE9BQU8sRUFBRSxJQUFJLElBQUksWUFBWSxFQUFFLE1BQU0saUNBQWlDLENBQUE7QUFDdEUsT0FBTyxFQUFFLElBQUksSUFBSSxpQkFBaUIsRUFBRSxNQUFNLDZCQUE2QixDQUFBO0FBQ3ZFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQTtBQXVCdkQsTUFBTSxDQUFDLE1BQU0sSUFBSSxHQUFHLEtBQUssRUFBRSxRQUFrQixFQUFFLFdBQThCLEVBQUUsRUFBRTtJQUM3RSxJQUFJLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUN0QixJQUFJLFVBQVUsQ0FBQTtRQUNkLDRFQUE0RTtRQUM1RSxJQUFJLFFBQVEsQ0FBQyxnQkFBZ0IsSUFBSSxRQUFRLENBQUMsVUFBVSxLQUFLLFVBQVUsRUFBRSxDQUFDO1lBQ2xFLFVBQVUsR0FBRyxNQUFNLGVBQWUsQ0FBQyxFQUFFLEdBQUcsUUFBUSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsRUFBRSxXQUFXLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUM3SCxDQUFDO1FBRUQsSUFBSSxjQUFjLENBQUE7UUFDbEIsSUFBSSxRQUFRLENBQUMsVUFBVSxJQUFJLFVBQVUsRUFBRSxDQUFDO1lBQ3BDLGNBQWMsR0FBRyxNQUFNLGVBQWUsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLFVBQVUsRUFBRSxXQUFXLENBQUMsUUFBUSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsT0FBTyxJQUFJLEVB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
