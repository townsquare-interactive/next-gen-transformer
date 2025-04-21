import { ScrapingError } from '../utilities/errors.js'
import type { SavingScrapedData } from '../output/save-scraped-data.js'
import { getDudaSite, updateSiteContent } from './duda-api.js'
import { savePagesToDuda } from './duda/save-pages.js'
import { saveBusinessInfoToDuda } from './duda/save-business-info.js'
import { saveColorsToDuda } from './duda/save-colors.js'
import { saveImages } from './duda/save-images.js'
import { ScrapedPageSeo } from '../schema/output-zod.js'

export const saveDudaSite = async (siteId: string, seoData?: ScrapedPageSeo, enableBusinessSchema?: boolean) => {
    const currentSiteData = await getDudaSite(siteId)
    const currentSiteSeo = currentSiteData?.site_seo
    await updateSiteContent(siteId, seoData, currentSiteSeo, enableBusinessSchema)
}

export async function save(saveData: SavingScrapedData) {
    const settings = saveData.settings

    if (!settings.uploadLocation) {
        console.log('no upload location for Duda')
        throw new ScrapingError({
            domain: settings.url,
            message: 'Failed to upload to Duda, no uploadLocation found',
            state: { scrapeStatus: 'Data not uploaded', method: settings.saveMethod },
            errorType: 'SCR-012',
        })
    }

    if (saveData.siteData?.pages) {
        const savePagesToDudaFunction = saveData.functions?.savePagesToDudaFunction || savePagesToDuda
        await savePagesToDudaFunction(settings.uploadLocation, saveData.siteData.pages)
    }

    if (saveData.siteData?.businessInfo?.styles.colors) {
        const saveColorsToDudaFunction = saveData.functions?.saveColorsToDudaFunction || saveColorsToDuda
        await saveColorsToDudaFunction(settings.uploadLocation, saveData.siteData.businessInfo.styles.colors)
    }

    const imageFiles = saveData.imageFiles
    const logoUrl = saveData.siteData?.assetData?.s3LogoUrl || saveData.logoUrl
    const fetchFunction = saveData.functions?.imageUploadFunction
    const imageData = await saveImages(settings, imageFiles, saveData.imageList || [], logoUrl, fetchFunction)
    const dudaLogoUrl = imageData.dudaLogoUrl

    let enableBusinessSchema: boolean = false
    if (saveData.siteData?.businessInfo) {
        const saveBusinessInfoToDudaFunction = saveData.functions?.saveBusinessInfoToDudaFunction || saveBusinessInfoToDuda
        enableBusinessSchema = await saveBusinessInfoToDudaFunction(
            settings.uploadLocation,
            dudaLogoUrl ?? '',
            saveData.siteData.businessInfo,
            saveData.siteData.pages,
            settings
        )
    }

    //enables business schema so must be after uploading business info
    if (saveData.siteData?.siteSeo || enableBusinessSchema) {
        const seoUploadFunction = saveData.functions?.seoUploadFunction || saveDudaSite
        //await seoUploadFunction(settings.uploadLocation, saveData.siteData.siteSeo)
        await seoUploadFunction(settings.uploadLocation, saveData.siteData?.siteSeo, enableBusinessSchema)
    }

    return imageData
}
