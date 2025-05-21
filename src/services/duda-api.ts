import { DudaResponse, UploadPayload } from './duda/save-images.js'
import { Settings } from './scrape-service.js'
import { ScrapedPageSeo } from '../schema/output-zod.js'
import { dudaApiClient } from './duda-api-client.js'
import { PageObject, LocationObject, BusinessInfoObject, DudaColors, DudaSiteSeo } from '../types/duda-api-type.js'
import { DataUploadError } from '../utilities/errors.js'

const dudaUserName = process.env.DUDA_USERNAME
const dudaPassword = process.env.DUDA_PASSWORD
const BASE_URL = process.env.DUDA_USE_SANDBOX === '1' ? 'https://api-sandbox.duda.co' : 'https://api.duda.co'

// Encode username and password for Basic Auth
const authStr = `${dudaUserName}:${dudaPassword}`
const authB64 = Buffer.from(authStr).toString('base64')
const HEADERS = {
    Authorization: `Basic ${authB64}`,
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
}

export async function dudaImageFetch(payload: UploadPayload[], settings?: Settings) {
    const siteName = settings?.uploadLocation
    //https://developer.duda.co/reference/site-content-upload-resources
    const dudaApiUrl = `${BASE_URL}/api/sites/multiscreen/resources/${siteName}/upload`

    const response = await fetch(dudaApiUrl, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        console.error(`status text: ${response.statusText}`)
        throw response.statusText
    }

    const responseData: DudaResponse = await response.json()
    return responseData
}

export async function getDudaSite(siteId: string) {
    try {
        const response = await dudaApiClient.getClient().sites.get({
            site_name: siteId,
        })

        return response
    } catch (error) {
        translateDudaError(error, siteId)
    }
}

export async function getDudaSiteId(gpid: string) {
    try {
        const decodedGpid = decodeURIComponent(gpid)
        const encodedGpid = encodeURIComponent(decodedGpid)

        const response = await dudaApiClient.getClient().sites.getByExternalID({
            external_uid: encodedGpid,
        })

        //duda does not throw an error if site is not found, so we need to check the response
        if (!response || !Array.isArray(response) || response.length === 0) {
            console.log('gpid', gpid)
            throw new DataUploadError({
                message: 'Duda site not found',
                domain: '',
                errorType: 'DUD-019',

                state: {
                    fileStatus: 'Duda site unchanged',
                },
            })
        }

        return response[0]
    } catch (error) {
        translateDudaError(error, gpid)
    }
}

export async function updateSiteContent(siteId: string, seoData?: ScrapedPageSeo, currentSiteSeo?: DudaSiteSeo | null, enableBusinessSchema?: boolean) {
    try {
        const response = await dudaApiClient.getClient().sites.update({
            site_name: siteId,
            site_seo: {
                ...(currentSiteSeo?.title || seoData?.title ? { title: currentSiteSeo?.title || seoData?.title } : {}),
                ...(currentSiteSeo?.description || seoData?.metaDescription ? { description: currentSiteSeo?.description || seoData?.metaDescription } : {}),
            },
            ...(enableBusinessSchema !== undefined && enableBusinessSchema !== null
                ? {
                      schemas: {
                          local_business: {
                              enabled: enableBusinessSchema,
                          },
                      },
                  }
                : {}),
        })
    } catch (error) {
        translateDudaError(error, siteId)
    }
}

export async function createDudaPage(siteName: string, pageData: PageObject) {
    const response = await dudaApiClient.getClient().pages.v2.create({
        site_name: siteName,
        page: {
            seo: pageData.seo
                ? {
                      no_index: pageData.seo.no_index ?? false,
                      title: pageData.seo.title || '',
                      description: pageData.seo.description || '',
                      og_image: pageData.seo.og_image || '',
                  }
                : undefined, // Avoid adding `seo` entirely if undefined
            draft_status: 'STAGED_DRAFT',
            title: pageData.title,
            path: pageData.path,
        },
    })

    return response
}

export async function getDudaColors(siteName: string) {
    try {
        const response = await dudaApiClient.getClient().sites.theme.get({
            site_name: siteName,
        })

        return response.colors
    } catch (error) {
        translateDudaError(error, siteName)
    }
}

export async function getBusinessInfoFromDuda(siteName: string) {
    try {
        const response = await dudaApiClient.getClient().content.get({
            site_name: siteName,
        })

        console.log('duda business info', response)

        return response
    } catch (error) {
        translateDudaError(error, siteName)
    }
}

export async function updateDudaTheme(siteName: string, colorData: DudaColors) {
    try {
        // @ts-expect-error - Duda API types are incomplete for theme update
        const response = await dudaApiClient.getClient().sites.theme.update({
            site_name: siteName,
            ...(colorData && { colors: colorData }),
        })

        return response
    } catch (error) {
        console.error(`error updating duda theme`, error)
        translateDudaError(error, siteName)
    }
}

export async function createDudaLocation(siteName: string, locationData: LocationObject) {
    try {
        const response = await dudaApiClient.getClient().content.multilocation.create({
            site_name: siteName,
            ...(locationData.label && { label: locationData.label }),
            ...(locationData.phones && { phones: locationData.phones }),
            ...(locationData.emails && { emails: locationData.emails }),
            ...(locationData.social_accounts && { social_accounts: locationData.social_accounts }),
            ...(locationData.address && { address: locationData.address }),
            ...(locationData.logo_url && { logo_url: locationData.logo_url }),
            ...(locationData.business_hours && {
                business_hours: locationData.business_hours.map(({ days, open, close }) => ({
                    days: days as ('MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN')[],
                    open,
                    close,
                })),
            }),
        })

        return response
    } catch (error) {
        console.error('error creating duda location', error)
        translateDudaError(error, siteName)
    }
}

export async function uploadBusinessInfo(siteName: string, businessInfo: BusinessInfoObject) {
    try {
        const response = await dudaApiClient.getClient().content.update({
            site_name: siteName,
            ...(businessInfo.business_data && { business_data: businessInfo.business_data }),
            ...(businessInfo.site_texts && { site_texts: businessInfo.site_texts }),
            location_data: {
                ...(businessInfo.location_data?.label && { label: businessInfo.location_data.label }),
                ...(businessInfo.location_data?.phones && { phones: businessInfo.location_data.phones }),
                ...(businessInfo.location_data?.emails && { emails: businessInfo.location_data.emails }),
                ...(businessInfo.location_data?.social_accounts && { social_accounts: businessInfo.location_data.social_accounts }),
                ...(businessInfo.location_data?.address && { address: businessInfo.location_data.address }),
                ...(businessInfo.location_data?.logo_url && { logo_url: businessInfo.location_data.logo_url }),
                ...(businessInfo.location_data?.business_hours && {
                    business_hours: businessInfo.location_data.business_hours.map(({ days, open, close }) => ({
                        days: days as ('MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN')[],
                        open,
                        close,
                    })),
                }),
                ...(businessInfo.location_data?.schema && { schema: businessInfo.location_data.schema }),
            },
        })

        return response
    } catch (error) {
        console.error('error uploading business info to duda', error)
        translateDudaError(error, siteName)
    }
}

interface DudaError {
    error: {
        message?: string
        error_code?: string
        data?: string
    }
    status: number
}

const translateDudaError = (error: DudaError[], siteName: string) => {
    console.log('duda error', error)

    if (error[0]) {
        const errorMessage = error[0]?.error?.message
        const errorCode = error[0]?.error?.error_code
        const errorStatus = error[0]?.status
        let errorMessageTranslation = ''

        console.log('duda error message', errorMessage)

        //Generic duda internal error
        if (errorCode === 'InternalError') {
            errorMessageTranslation = 'Duda API internal error'
        }

        //error message does not exist with 401 so we can add it
        if (errorStatus === 401) {
            errorMessageTranslation = 'Invalid Duda API credentials'
        }

        //siteName not found (could also be sandbox/prod env variable mismatch)
        if (errorCode === 'ResourceNotExist') {
            console.log('unable to find site, using sandbox? ', process.env.DUDA_USE_SANDBOX)
            console.log('site name: ', siteName)
        }

        throw new DataUploadError({
            message: errorMessageTranslation || errorMessage || 'Duda API error',
            domain: '',
            errorType: 'DUD-018',
            state: {
                fileStatus: 'Duda data not uploaded correctly',
                dudaErrorCode: errorCode,
                dudaErrorStatus: errorStatus,
            },
        })
    } else {
        throw new DataUploadError({
            message: 'Duda generic API error',
            domain: '',
            errorType: 'DUD-018',
            state: {
                fileStatus: 'Duda data not uploaded correctly',
            },
        })
    }
}
