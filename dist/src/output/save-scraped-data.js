import { ScrapingError } from '../utilities/errors.js'
import { save as WriteToFile } from '../services/write-to-folder.js'
import { save as s3FileUpload } from '../services/s3-images-upload.js'
import { save as batchUploadToDuda } from '../services/save-to-duda.js'
import { addFileS3 } from '../utilities/s3Functions.js'
import { ScrapedAndAnalyzedSiteDataSchema } from '../schema/output-zod.js'
import { zodDataParse } from '../schema/utils-zod.js'
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
        const websiteData = { ...siteData, s3LogoUrl: savedImages.logoUrl || '' }
        const validatedSiteData = zodDataParse(websiteData, ScrapedAndAnalyzedSiteDataSchema, 'scrapedOutput')
        if (settings.saveMethod === 's3Upload') {
            await saveSiteDataToS3(settings, validatedSiteData)
        }
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
            save = s3FileUpload
            break
        default:
            save = s3FileUpload
            break
    }
    const savedInfo = await save(settings, imageFiles, logoUrl)
    return {
        uploadedImages: savedInfo.uploadedImages || [],
        imageUploadCount: savedInfo.imageUploadCount || 0,
        failedImageList: savedInfo.failedImageList || [],
        logoUrl: savedInfo.logoUrl || '',
    }
}
export const saveSiteDataToS3 = async (settings, scrapedPageData) => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2F2ZS1zY3JhcGVkLWRhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb3V0cHV0L3NhdmUtc2NyYXBlZC1kYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQTtBQUN0RCxPQUFPLEVBQUUsSUFBSSxJQUFJLFdBQVcsRUFBRSxNQUFNLGdDQUFnQyxDQUFBO0FBQ3BFLE9BQU8sRUFBRSxJQUFJLElBQUksWUFBWSxFQUFFLE1BQU0saUNBQWlDLENBQUE7QUFDdEUsT0FBTyxFQUFFLElBQUksSUFBSSxpQkFBaUIsRUFBRSxNQUFNLDZCQUE2QixDQUFBO0FBQ3ZFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQTtBQUV2RCxPQUFPLEVBQThCLGdDQUFnQyxFQUFtQixNQUFNLHlCQUF5QixDQUFBO0FBQ3ZILE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQTtBQWdCckQsTUFBTSxDQUFDLE1BQU0sSUFBSSxHQUFHLEtBQUssRUFBRSxRQUFrQixFQUFFLFdBQThCLEVBQUUsRUFBRTtJQUM3RSxJQUFJLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUN0QixJQUFJLFVBQVUsQ0FBQTtRQUNkLDRFQUE0RTtRQUM1RSxJQUFJLFFBQVEsQ0FBQyxnQkFBZ0IsSUFBSSxRQUFRLENBQUMsVUFBVSxLQUFLLFVBQVUsRUFBRSxDQUFDO1lBQ2xFLFVBQVUsR0FBRyxNQUFNLGVBQWUsQ0FBQyxFQUFFLEdBQUcsUUFBUSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsRUFBRSxXQUFXLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUM3SCxDQUFDO1FBRUQsSUFBSSxjQUFjLENBQUE7UUFDbEIsSUFBSSxRQUFRLENBQUMsVUFBVSxJQUFJLFVBQVUsRUFBRSxDQUFDO1lBQ3BDLGNBQWMsR0FBRyxNQUFNLGVB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
