import { ContentLibraryResponse } from '@dudadev/partner-api/dist/types/lib/content/types.js'
import { ScrapedAndAnalyzedSiteData } from '../../schema/output-zod.js'
import { BusinessInfoObject, LocationObject } from '../../types/duda-api-type.js'
import { createDudaLocation, getBusinessInfoFromDuda, uploadBusinessInfo } from '../duda-api.js'
import { Settings } from '../scrape-service.js'
import { combineSocialAccounts, transformHoursToDudaFormat, transformTextToDudaFormat, createCombinedAddress } from '../../api/scrapers/utils.js'
import { schemaOrgBusinessTypes } from '../../api/scrapers/constants.js'
export type BusinessInfoData = ScrapedAndAnalyzedSiteData['businessInfo']

export async function saveBusinessInfoToDuda(
    siteId: string,
    logoUrl: string,
    businessInfo: BusinessInfoData,
    pages: ScrapedAndAnalyzedSiteData['pages'],
    settings: Settings
) {
    //get info first if secondary site
    const siteType = settings.siteType
    let currentBusinessInfo: ContentLibraryResponse | undefined

    if (siteType === 'secondary') {
        console.log('getting business info from duda')
        const getBusinessInfoFunction = settings.functions?.getBusinessInfo || getBusinessInfoFromDuda
        currentBusinessInfo = await getBusinessInfoFunction(siteId)
    }

    const currentLocationInfo = currentBusinessInfo?.location_data
    const { socialAccounts, skippedLinks } = combineSocialAccounts(currentLocationInfo, businessInfo)

    const locations = transformBusinessInfoDataToDudaLocations(logoUrl, businessInfo, socialAccounts, currentBusinessInfo)
    const primaryLocation = locations[0]

    const transformedBusinessInfoData: BusinessInfoObject = transformBusinessInfoDataToDudaFormat(
        logoUrl,
        businessInfo,
        pages,
        primaryLocation,
        skippedLinks || [],
        currentBusinessInfo
    )

    await uploadBusinessInfo(siteId, transformedBusinessInfoData)

    //adding alternate locations
    if (locations.length === 2) {
        console.log('adding 2nd location')
        const response = await createDudaLocation(siteId, locations[1])
        console.log(`Successfully saved business info for site: ${siteId}`, response)
    }

    //enable business schema
    let enableBusinessSchema = false
    if (transformedBusinessInfoData.location_data) {
        let doesAddressExist = false
        let doesCompanyNameExist = false
        if (transformedBusinessInfoData.location_data.address?.city && transformedBusinessInfoData.location_data.address?.postalCode) {
            doesAddressExist = true
        }
        if (transformedBusinessInfoData.companyName) {
            doesCompanyNameExist = true
        }

        if (doesAddressExist && doesCompanyNameExist) {
            enableBusinessSchema = true
        }
    }

    return enableBusinessSchema
}

export const transformBusinessInfoDataToDudaFormat = (
    logoUrl: string,
    businessInfo: BusinessInfoData,
    pages: ScrapedAndAnalyzedSiteData['pages'],
    transformedLocationData: LocationObject,
    skippedLinks: string[],
    currentBusinessInfo?: ContentLibraryResponse
): BusinessInfoObject => {
    // Transform pages into custom text array with content splitting
    const customTexts = transformTextToDudaFormat(pages, businessInfo, skippedLinks)
    const transformedData = {
        companyName: currentBusinessInfo?.business_data?.name ?? businessInfo?.companyName ?? '',
        site_texts: {
            custom: customTexts,
        },
        business_data: {
            name: currentBusinessInfo?.business_data?.name ?? businessInfo?.companyName ?? '',
            logo_url: currentBusinessInfo?.business_data?.logo_url ?? logoUrl,
        },
        location_data: transformedLocationData,
    }

    return transformedData
}

export function transformBusinessInfoDataToDudaLocations(
    logoUrl: string,
    businessInfo: BusinessInfoData,
    socialAccounts: LocationObject['social_accounts'],
    currentBusinessInfo?: ContentLibraryResponse
): LocationObject[] {
    const locations: LocationObject[] = []
    const currentLocationInfo = currentBusinessInfo?.location_data
    let addSecondLocation = false
    let combinedBusinessAddress = businessInfo?.address

    //We are working with a secondary site
    if (currentLocationInfo) {
        const addressData = createCombinedAddress(businessInfo, currentBusinessInfo)
        addSecondLocation = addressData.addSecondLocation
        combinedBusinessAddress = addressData.newAddressData
    }

    //duda business type from schema.org
    let businessType = null
    if (businessInfo?.businessType) {
        const cleanedBusinessType = businessInfo?.businessType?.replace(' ', '')
        if (schemaOrgBusinessTypes.includes(cleanedBusinessType)) {
            businessType = cleanedBusinessType
        }
    }

    //logic breakdown
    //If we are adding a second location -> use current info if available for first location and new business info for second location. Replace certain things in primary location if not currently there with new info (phone, email, social accounts)
    //If we are not adding a second location -> use current info if available for first location and new business info for fields that are not available
    const firstLocation: LocationObject = {
        label: currentLocationInfo?.label ? currentLocationInfo?.label : businessInfo?.companyName ?? '',
        phones:
            (!addSecondLocation && currentLocationInfo?.phones?.[0]?.phoneNumber) || addSecondLocation
                ? [{ phoneNumber: currentLocationInfo?.phones?.[0]?.phoneNumber || '', label: 'Phone' }]
                : businessInfo?.phoneNumber
                ? [{ phoneNumber: businessInfo.phoneNumber, label: 'Phone' }]
                : undefined,
        emails: currentLocationInfo?.emails?.[0]?.emailAddress
            ? [{ emailAddress: currentLocationInfo.emails[0].emailAddress, label: 'Email' }]
            : businessInfo?.email
            ? [{ emailAddress: businessInfo.email, label: 'Email' }]
            : undefined,
        address:
            businessInfo?.address || currentBusinessInfo?.location_data?.address
                ? {
                      streetAddress: combinedBusinessAddress?.streetAddress ?? '',
                      city: combinedBusinessAddress?.city ?? '',
                      region: combinedBusinessAddress?.state ?? '',
                      postalCode: combinedBusinessAddress?.postalCode ?? '',
                      country: 'US',
                  }
                : undefined,
        logo_url: currentLocationInfo?.logo_url ? currentLocationInfo.logo_url : logoUrl,
        social_accounts: socialAccounts,
        ...(businessType && { schema: { type: businessType } }),
        business_hours: addSecondLocation
            ? currentLocationInfo?.business_hours && currentLocationInfo.business_hours.length > 0
                ? currentLocationInfo.business_hours
                : null
            : currentLocationInfo?.business_hours && currentLocationInfo.business_hours.length > 0
            ? currentLocationInfo.business_hours
            : transformHoursToDudaFormat(businessInfo?.hours) || undefined,
    }
    locations.push(firstLocation)

    //if we are adding a second location -> only use new businessInfo location for second location
    if (addSecondLocation) {
        const secondLocation: LocationObject = {
            label: businessInfo?.companyName ?? '',
            phones: businessInfo?.phoneNumber ? [{ phoneNumber: businessInfo.phoneNumber, label: 'Phone' }] : undefined,
            address: businessInfo?.address
                ? {
                      streetAddress: businessInfo?.address?.streetAddress ?? '',
                      city: businessInfo?.address?.city ?? '',
                      region: businessInfo?.address?.state ?? '',
                      postalCode: businessInfo?.address?.postalCode ?? '',
                      country: businessInfo?.address?.country ?? 'US',
                  }
                : undefined,
            logo_url: logoUrl,
            social_accounts: socialAccounts,
            business_hours: transformHoursToDudaFormat(businessInfo?.hours) || undefined,
        }
        locations.push(secondLocation)
    }

    return locations
}
