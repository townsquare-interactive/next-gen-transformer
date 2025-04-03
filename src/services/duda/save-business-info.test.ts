import { describe, it, expect } from 'vitest'
import { transformBusinessInfoDataToDudaLocation, transformBusinessInfoDataToDudaFormat } from './save-business-info.ts'
import mockBusinessInfoObject from './mocks/mock-business-info-object.json'
import { ScrapedAndAnalyzedSiteData } from '../../schema/output-zod.js'

type BusinessInfoData = ScrapedAndAnalyzedSiteData['businessInfo']

describe('transformBusinessInfoDataToDudaLocation', () => {
    const logoUrl = 'https://example.com/logo.png'

    it('should transform business info to Duda format', () => {
        const result = transformBusinessInfoDataToDudaLocation(logoUrl, mockBusinessInfoObject)

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
        const result = transformBusinessInfoDataToDudaLocation(logoUrl, {} as BusinessInfoData)

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

    it('should transform alternate hours format to Duda format', () => {
        const result = transformBusinessInfoDataToDudaLocation(logoUrl, {
            ...mockBusinessInfoObject,
            hours: {
                MON: '9:00am to 11:00pm',
                TUE: '9:00am to 11:00pm',
                WED: '8:00am - 12:00am',
                THU: '9:00am - 11:00pm',
                FRI: '9:00am - 11:00pm',
                SAT: '10am - 10pm',
                SUN: '10am - 10pm',
            },
        })

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
})

describe('transformBusinessInfoToDudaFormat', () => {
    it('should transform business info to Duda format', () => {
        const logoUrl = 'https://example.com/logo.png'

        const pages = [{ content: 'check stuff', url: 'https://example.com/page1', images: [], forms: [], title: 'June Foot Spa' }]
        const result = transformBusinessInfoDataToDudaFormat(logoUrl, mockBusinessInfoObject, pages)

        const transformedResultCheck = {
            companyName: 'June Foot Spa',
            site_texts: {
                custom: [{ label: 'June Foot Spa', text: 'check stuff' }],
            },
            business_data: {
                name: 'June Foot Spa',
                logo_url: logoUrl,
            },
        }

        expect(result).toEqual(transformedResultCheck)
    })
})
