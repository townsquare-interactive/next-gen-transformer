import { ScrapingError } from '../utilities/errors.js'
import type { SavingScrapedData } from '../output/save-scraped-data.js'
import { getDudaSite, uploadSiteSEOToDuda } from './duda-api.js'
import { savePagesToDuda } from './duda/save-pages.js'
import { saveBusinessInfoToDuda } from './duda/save-business-info.js'
import { saveColorsToDuda } from './duda/save-colors.js'
import { saveImages } from './duda/save-images.js'
import { ScrapedPageSeo } from '../schema/output-zod.js'

const saveSiteSEO = async (siteId: string, seoData: ScrapedPageSeo) => {
    const currentSiteData = await getDudaSite(siteId)
    const currentSiteSeo = currentSiteData?.site_seo
    await uploadSiteSEOToDuda(siteId, seoData, currentSiteSeo)
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

    if (saveData.siteData?.siteSeo) {
        const seoUploadFunction = saveData.functions?.seoUploadFunction || saveSiteSEO
        //await seoUploadFunction(settings.uploadLocation, saveData.siteData.siteSeo)
        await seoUploadFunction(settings.uploadLocation, saveData.siteData.siteSeo)
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

    if (saveData.siteData?.businessInfo) {
        const saveBusinessInfoToDudaFunction = saveData.functions?.saveBusinessInfoToDudaFunction || saveBusinessInfoToDuda
        await saveBusinessInfoToDudaFunction(settings.uploadLocation, dudaLogoUrl ?? '', saveData.siteData.businessInfo, saveData.siteData.pages, settings)
    }

    return imageData
}
