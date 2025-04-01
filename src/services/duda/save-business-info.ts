import { ScrapedAndAnalyzedSiteData } from '../../schema/output-zod.js'
import { LocationObject } from '../../types/duda-api-type.js'
import { createDudaLocation } from '../duda-api.js'

type BusinessInfoData = ScrapedAndAnalyzedSiteData['businessInfo']

export async function saveBusinessInfoToDuda(siteId: string, logoUrl: string, businessInfo: BusinessInfoData) {
    try {
        const transformedBusinessInfoData: LocationObject = transformBusinessInfoDataToDudaFormat(logoUrl, businessInfo)

        const response = await createDudaLocation(siteId, transformedBusinessInfoData)
        console.log(`Successfully saved business info for site: ${siteId}`, response)
    } catch (error) {
        console.error(`Failed to save business info for site: ${siteId}`, error)
    }
}

export function transformBusinessInfoDataToDudaFormat(logoUrl: string, businessInfo: BusinessInfoData): LocationObject {
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
            ? Object.entries(businessInfo.hours).map(([day, hours]) => {
                  if (!hours) return { days: [day as DayType], open: '', close: '' }

                  // Extract and trim times
                  let [open, close] = hours.split('-').map((str) => str.trim())

                  // Ensure correct 24-hour format (HH:mm)
                  const formatTime = (time: string) => {
                      const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i)

                      if (!match) return '' // Return empty string if invalid format

                      const [, hour, minute, period] = match
                      let hourNum = parseInt(hour, 10)

                      if (period) {
                          // Convert AM/PM to 24-hour format if present
                          if (period.toUpperCase() === 'PM' && hourNum < 12) {
                              hourNum += 12
                          } else if (period.toUpperCase() === 'AM' && hourNum === 12) {
                              hourNum = 0
                          }
                      }

                      // Ensure two-digit hour and minute format
                      return `${String(hourNum).padStart(2, '0')}:${minute}`
                  }

                  open = formatTime(open)
                  close = formatTime(close)

                  // Fix case where "24:00" is used (should be "00:00" next day)
                  if (close === '24:00') close = '00:00'

                  return { days: [day as DayType], open, close }
              })
            : undefined,
    }
}

type DayType = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'
