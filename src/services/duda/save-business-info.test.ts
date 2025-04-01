import { describe, it, expect } from 'vitest'
import { transformBusinessInfoDataToDudaFormat } from './save-business-info.ts'
import mockBusinessInfoObject from './mocks/mock-business-info-object.json'
import { ScrapedAndAnalyzedSiteData } from '../../schema/output-zod.js'

type BusinessInfoData = ScrapedAndAnalyzedSiteData['businessInfo']

describe('transformBusinessInfoDataToDudaFormat', () => {
    const logoUrl = 'https://example.com/logo.png'

    it('should transform business info to Duda format', () => {
        const result = transformBusinessInfoDataToDudaFormat(logoUrl, mockBusinessInfoObject)

        expect(result).toEqual({
            label: 'June Foot Spa',
            phones: [{ phoneNumber: '(929) 566-7799', label: 'Main' }],
            emails: [{ emailAddress: 'howareyoucolin@gmail.com', label: 'Main' }],
            address: {
                streetAddress: '149-36 Northern Blvd',
                city: 'Flushing',
                postalCode: '11354',
                country: 'US',
            },
            logo_url: logoUrl,
            business_hours: [
                { days: ['MON'], open: '09:00', close: '23:00' },
                { days: ['TUE'], open: '09:00', close: '23:00' },
                { days: ['WED'], open: '08:00', close: '00:00' },
                { days: ['THU'], open: '09:00', close: '23:00' },
                { days: ['FRI'], open: '09:00', close: '23:00' },
                { days: ['SAT'], open: '10:00', close: '22:00' },
                { days: ['SUN'], open: '10:00', close: '22:00' },
            ],
        })
    })

    it('should handle missing optional fields correctly', () => {
        const result = transformBusinessInfoDataToDudaFormat(logoUrl, {} as BusinessInfoData)

        expect(result).toEqual({
            label: '',
            logo_url: logoUrl,
        })

        // Ensure that missing fields are explicitly undefined
        expect(result.phones).toBeUndefined()
        expect(result.emails).toBeUndefined()
        expect(result.address).toBeUndefined()
        expect(result.business_hours).toBeUndefined()
    })
})
