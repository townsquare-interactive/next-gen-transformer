import { ScrapedAndAnalyzedSiteData } from '../../schema/output-zod.js'
import { BusinessInfoObject, LocationObject } from '../../types/duda-api-type.js'
import { createDudaLocation, uploadBusinessInfo } from '../duda-api.js'

type BusinessInfoData = ScrapedAndAnalyzedSiteData['businessInfo']

export async function saveBusinessInfoToDuda(siteId: string, logoUrl: string, businessInfo: BusinessInfoData, pages: ScrapedAndAnalyzedSiteData['pages']) {
    const transformedLocationData: LocationObject = transformBusinessInfoDataToDudaLocation(logoUrl, businessInfo)

    const transformedBusinessInfoData: BusinessInfoObject = transformBusinessInfoDataToDudaFormat(logoUrl, businessInfo, pages)

    const busInfoRes = await uploadBusinessInfo(siteId, transformedBusinessInfoData)
    console.log('Duda business info response: ', busInfoRes)

    const response = await createDudaLocation(siteId, transformedLocationData)

    console.log(`Successfully saved business info for site: ${siteId}`, response)
}

export const transformBusinessInfoDataToDudaFormat = (
    logoUrl: string,
    businessInfo: BusinessInfoData,
    pages: ScrapedAndAnalyzedSiteData['pages']
): BusinessInfoObject => {
    // Transform pages into custom text array with content splitting
    const customTexts = pages.flatMap((page) => {
        const content = (page.content || '').replace(/\n/g, '<br>')
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

        // Split content into chunks of 4000 characters
        // Try to split at sentence or paragraph boundaries
        const chunks: string[] = []
        let currentChunk = ''
        const sentences = content.split(/(?<=[.!?])\s+/)

        for (const sentence of sentences) {
            if ((currentChunk + sentence).length <= chunkSize) {
                currentChunk += (currentChunk ? ' ' : '') + sentence
            } else {
                if (currentChunk) chunks.push(currentChunk)
                currentChunk = sentence
            }
        }
        if (currentChunk) chunks.push(currentChunk)

        // Create array of labeled chunks
        return chunks.map((chunk, index) => ({
            label: chunks.length > 1 ? `${page.title || ''} (Part ${index + 1})` : page.title || '',
            text: chunk,
        }))
    })

    const transformedData = {
        companyName: businessInfo?.companyName ?? '',
        site_texts: {
            custom: customTexts,
        },
        business_data: {
            name: businessInfo?.companyName ?? '',
            logo_url: logoUrl,
        },
    }

    console.log('transformedData buiness_data', transformedData.business_data)

    return transformedData
}

export function transformBusinessInfoDataToDudaLocation(logoUrl: string, businessInfo: BusinessInfoData): LocationObject {
    return {
        label: businessInfo?.companyName ?? '',
        phones: businessInfo?.phoneNumber ? [{ phoneNumber: businessInfo.phoneNumber, label: 'Main' }] : undefined,
        emails: businessInfo?.email ? [{ emailAddress: businessInfo.email, label: 'Main' }] : undefined,
        address: businessInfo?.address
            ? {
                  streetAddress: businessInfo?.address?.streetAddress ?? '',
                  city: businessInfo?.address?.city ?? '',
                  postalCode: businessInfo?.address?.postalCode ?? '',
                  country: businessInfo?.address?.country ?? 'US',
              }
            : undefined,
        logo_url: logoUrl,
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
type DayType = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'
