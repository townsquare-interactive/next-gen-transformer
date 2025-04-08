import { SocialAccounts } from '@dudadev/partner-api/dist/types/lib/content/types.js'
import { ScrapedAndAnalyzedSiteData } from '../../schema/output-zod.js'
import { BusinessInfoObject, LocationObject } from '../../types/duda-api-type.js'
import { createDudaLocation, uploadBusinessInfo } from '../duda-api.js'

type BusinessInfoData = ScrapedAndAnalyzedSiteData['businessInfo']

export async function saveBusinessInfoToDuda(siteId: string, logoUrl: string, businessInfo: BusinessInfoData, pages: ScrapedAndAnalyzedSiteData['pages']) {
    const transformedLocationData: LocationObject = transformBusinessInfoDataToDudaLocation(logoUrl, businessInfo)

    const transformedBusinessInfoData: BusinessInfoObject = transformBusinessInfoDataToDudaFormat(logoUrl, businessInfo, pages, transformedLocationData)

    await uploadBusinessInfo(siteId, transformedBusinessInfoData)

    //adding alternate locations
    //const response = await createDudaLocation(siteId, transformedLocationData)
    //console.log(`Successfully saved business info for site: ${siteId}`, response)
}

const determineSocialAccountType = (str: string) => {
    if (str.includes('google')) return 'google'
    if (str.includes('facebook')) return 'facebook'
    if (str.includes('instagram')) return 'instagram'
    if (str.includes('twitter')) return 'twitter'
    if (str.includes('linkedin')) return 'linkedin'
    if (str.includes('youtube') || str.includes('youtu.be')) return 'youtube'
    if (str.includes('pinterest')) return 'pinterest'
    if (str.includes('vimeo')) return 'vimeo'
    if (str.includes('/x.com')) return 'twitter'
    if (str.includes('tiktok')) return 'tiktok'
    if (str.includes('yelp')) return 'yelp'
    if (str.includes('foursquare')) return 'foursquare'
    if (str.includes('rss')) return 'rss'
    if (str.includes('reddit')) return 'reddit'
    if (str.includes('tripadvisor')) return 'tripadvisor'
    if (str.includes('snapchat')) return 'snapchat'
    return null
}

export const transformSocialAccountsToDudaFormat = (businessInfo: BusinessInfoData) => {
    const socialLinks = businessInfo?.links?.socials
    if (!socialLinks?.length) return {}

    const socialAccounts: Record<string, string> = {}

    socialLinks.forEach((link) => {
        try {
            const url = new URL(link)
            // Get the path without query parameters
            const pathSegments = url.pathname.split('/').filter(Boolean)
            let finalSegment = pathSegments[pathSegments.length - 1]

            if (finalSegment) {
                // Remove any query parameters if they exist
                finalSegment = finalSegment.split('?')[0]
                // Clean up any remaining special characters
                finalSegment = finalSegment.replace(/[^a-zA-Z0-9-_]/g, '')

                const type = determineSocialAccountType(link.toLowerCase())
                if (type && finalSegment && finalSegment.length < 61) {
                    socialAccounts[type] = finalSegment
                } else {
                    console.warn('Invalid URL in social links:', link)
                }
            }
        } catch (error) {
            console.warn('Invalid URL in social links:', link)
        }
    })

    return socialAccounts
}

export const transformBusinessInfoDataToDudaFormat = (
    logoUrl: string,
    businessInfo: BusinessInfoData,
    pages: ScrapedAndAnalyzedSiteData['pages'],
    transformedLocationData: LocationObject
): BusinessInfoObject => {
    // Transform pages into custom text array with content splitting
    const customTexts = transformTextToDudaFormat(pages, businessInfo)

    const transformedData = {
        companyName: businessInfo?.companyName ?? '',
        site_texts: {
            custom: customTexts,
        },
        business_data: {
            name: businessInfo?.companyName ?? '',
            logo_url: logoUrl,
        },
        location_data: transformedLocationData,
    }

    return transformedData
}

export function transformBusinessInfoDataToDudaLocation(logoUrl: string, businessInfo: BusinessInfoData): LocationObject {
    return {
        label: businessInfo?.companyName ?? '',
        phones: businessInfo?.phoneNumber ? [{ phoneNumber: businessInfo.phoneNumber, label: 'Phone' }] : undefined,
        emails: businessInfo?.email ? [{ emailAddress: businessInfo.email, label: 'Email' }] : undefined,
        address: businessInfo?.address
            ? {
                  streetAddress: businessInfo?.address?.streetAddress ?? '',
                  city: businessInfo?.address?.city ?? '',
                  postalCode: businessInfo?.address?.postalCode ?? '',
                  country: businessInfo?.address?.country ?? 'US',
              }
            : undefined,
        logo_url: logoUrl,
        social_accounts: transformSocialAccountsToDudaFormat(businessInfo),
        business_hours: businessInfo?.hours
            ? (() => {
                  const hours = Object.entries(businessInfo.hours).map(([day, hours]) => {
                      if (!hours) return undefined

                      // Replace "to" with "-" and extract times
                      const normalizedHours = hours.replace(/\s+to\s+/i, ' - ')
                      let [open, close] = normalizedHours.split('-').map((str) => str.trim())

                      // Ensure correct 24-hour format (HH:mm)
                      const formatTime = (time: string) => {
                          // Remove any dots and normalize spacing
                          time = time.replace(/\./g, '').replace(/\s+/g, '')

                          // Convert to lowercase for consistency
                          time = time.toLowerCase()

                          // Handle format without minutes (e.g., "10am" -> "10:00am")
                          if (!time.includes(':')) {
                              time = time.replace(/^(\d{1,2})(am|pm)$/, '$1:00$2')
                          }

                          // Now parse the standardized format
                          const match = time.match(/^(\d{1,2}):?(\d{2})?\s*(am|pm)?$/i)
                          if (!match) return '' // Return empty string if invalid format

                          const [, hour, minute = '00', period] = match
                          let hourNum = parseInt(hour, 10)

                          if (period) {
                              // Convert AM/PM to 24-hour format
                              if (period.toLowerCase() === 'pm' && hourNum < 12) {
                                  hourNum += 12
                              } else if (period.toLowerCase() === 'am' && hourNum === 12) {
                                  hourNum = 0
                              }
                          }

                          // Ensure two-digit hour and minute format
                          return `${String(hourNum).padStart(2, '0')}:${minute}`
                      }

                      if (!open || !close) return undefined

                      open = formatTime(open)
                      close = formatTime(close)

                      if (!open || !close) return undefined

                      // Fix case where "24:00" is used (should be "00:00" next day)
                      if (close === '24:00') close = '00:00'

                      return { days: [day as DayType], open, close }
                  })

                  // Filter out undefined values and check if we have any valid hours
                  const validHours = hours.filter((entry): entry is { days: DayType[]; open: string; close: string } => entry !== undefined)
                  return validHours.length > 0 ? validHours : undefined
              })()
            : undefined,
    }
}

export const transformTextToDudaFormat = (pages: ScrapedAndAnalyzedSiteData['pages'], businessInfo: BusinessInfoData) => {
    const customTexts = pages.flatMap((page) => {
        if (!page.content) return []
        const chunks: string[] = []
        const content = (page.content || '').replace(/\n/g, '<br>') //add line breaks
        const chunkSize = 4000

        // If content is under the limit, return single entry
        if (content.length <= chunkSize) {
            return [
                {
                    label: page.title || '',
                    text: content,
                },
            ]
        }

        // Split content into chunks of exactly 4000 characters

        for (let i = 0; i < content.length; i += chunkSize) {
            chunks.push(content.slice(i, i + chunkSize))
        }

        // Create array of labeled chunks
        return chunks.map((chunk, index) => ({
            label: chunks.length > 1 ? `${page.title || ''} (Part ${index + 1})` : page.title || '',
            text: chunk,
        }))
    })

    const fonts = businessInfo?.styles?.fonts
    let fontText
    if (fonts) {
        const headerFonts = fonts.headerFonts?.join(', ')
        const bodyFonts = fonts.bodyFonts?.join(', ')

        fontText = {
            label: 'Fonts',
            text: `Header Fonts: ${headerFonts || ''}<br><br>Body Fonts: ${bodyFonts || ''}`,
        }
        customTexts.push(fontText)
    }

    return customTexts
}
type DayType = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'
