import { describe, it, expect } from 'vitest'
import { transformBusinessInfoDataToDudaLocation, transformBusinessInfoDataToDudaFormat, transformSocialAccountsToDudaFormat } from './save-business-info.ts'
import mockBusinessInfoObject from './mocks/mock-business-info-object.json'
import { ScrapedAndAnalyzedSiteData } from '../../schema/output-zod.js'

type BusinessInfoData = ScrapedAndAnalyzedSiteData['businessInfo']

describe('transformBusinessInfoDataToDudaLocation', () => {
    const logoUrl = 'https://example.com/logo.png'

    it('should transform business info to Duda format', () => {
        const result = transformBusinessInfoDataToDudaLocation(logoUrl, mockBusinessInfoObject)

        expect(result).toEqual({
            label: 'June Foot Spa',
            phones: [{ phoneNumber: '(929) 566-7799', label: 'Phone' }],
            emails: [{ emailAddress: 'howareyoucolin@gmail.com', label: 'Email' }],
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
            social_accounts: {},
        })
    })

    it('should handle missing optional fields correctly', () => {
        const result = transformBusinessInfoDataToDudaLocation(logoUrl, {} as BusinessInfoData)

        expect(result).toEqual({
            label: '',
            logo_url: logoUrl,
            social_accounts: {},
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
            phones: [{ phoneNumber: '(929) 566-7799', label: 'Phone' }],
            emails: [{ emailAddress: 'howareyoucolin@gmail.com', label: 'Email' }],
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
            social_accounts: {},
        })
    })
    it('should transform social accounts to duda format', () => {
        const result = transformBusinessInfoDataToDudaLocation(logoUrl, {
            ...mockBusinessInfoObject,
            links: {
                socials: [
                    'https://www.facebook.com/mybusiness',
                    'https://www.instagram.com/mycompany?querytest?josh',
                    'https://x.com/twitterhandle',
                    'https://www.yelp.com/biz/my-business-name',
                    'https://www.linkedin.com/company/companyname',
                ],
                other: [],
            },
        })
        expect(result.social_accounts).toEqual({
            facebook: 'mybusiness',
            instagram: 'mycompany',
            twitter: 'twitterhandle',
            yelp: 'my-business-name',
            linkedin: 'companyname',
        })
    })
})

describe('transformBusinessInfoToDudaFormat', () => {
    const logoUrl = 'https://example.com/logo.png'
    const dudaLocationData = {
        label: 'June Foot Spa',
        phones: [{ phoneNumber: '(929) 566-7799', label: 'Phone' }],
        emails: [{ emailAddress: 'howareyoucolin@gmail.com', label: 'Email' }],
        address: {
            streetAddress: '149-36 Northern Blvd',
            city: 'Flushing',
            postalCode: '11354',
            country: 'US',
        },
        logo_url: logoUrl,
        business_hours: [
            { days: ['MON' as const], open: '09:00', close: '23:00' },
            { days: ['TUE' as const], open: '09:00', close: '23:00' },
            { days: ['WED' as const], open: '08:00', close: '00:00' },
            { days: ['THU' as const], open: '09:00', close: '23:00' },
            { days: ['FRI' as const], open: '09:00', close: '23:00' },
            { days: ['SAT' as const], open: '10:00', close: '22:00' },
            { days: ['SUN' as const], open: '10:00', close: '22:00' },
        ],
        social_accounts: {},
        links: {
            socials: [
                'https://www.facebook.com/mybusiness',
                'https://www.instagram.com/mycompany',
                'https://x.com/twitterhandle',
                'https://www.yelp.com/biz/my-business-name',
                'https://www.linkedin.com/company/companyname',
            ],
        },
    }
    it('should transform business info to Duda format', () => {
        const pages = [
            { content: 'check stuff', url: 'https://example.com/page1', images: [], forms: [], title: 'June Foot Spa' },
            { content: 'page 2 content', url: 'https://example.com/page2', images: [], forms: [], title: 'June Page 2' },
        ]
        const result = transformBusinessInfoDataToDudaFormat(logoUrl, mockBusinessInfoObject, pages, dudaLocationData)

        const transformedResultCheck = {
            companyName: 'June Foot Spa',
            site_texts: {
                custom: [
                    { label: 'June Foot Spa', text: 'check stuff' },
                    { label: 'June Page 2', text: 'page 2 content' },
                    { label: 'Fonts', text: 'Header Fonts: Arial, Helvetica<br><br>Body Fonts: Arial, Helvetica' },
                ],
            },
            business_data: {
                name: 'June Foot Spa',
                logo_url: logoUrl,
            },
            location_data: dudaLocationData,
        }

        expect(result).toEqual(transformedResultCheck)
    })
    it('should handle null fonts and content wihtout error', () => {
        const logoUrl = 'https://example.com/logo.png'

        const pages = [{ content: null, url: 'https://example.com/page1', images: [], forms: [], title: 'June Foot Spa' }]
        const result = transformBusinessInfoDataToDudaFormat(
            logoUrl,
            { ...mockBusinessInfoObject, styles: { fonts: null, colors: null } },
            pages,
            dudaLocationData
        )

        const transformedResultCheck = {
            companyName: 'June Foot Spa',
            site_texts: {
                custom: [],
            },
            business_data: {
                name: 'June Foot Spa',
                logo_url: logoUrl,
            },
            location_data: dudaLocationData,
        }

        expect(result).toEqual(transformedResultCheck)
    })
})

describe('transformSocialAccountsToDudaFormat', () => {
    it('should transform social media links correctly', () => {
        const businessInfo: Partial<BusinessInfoData> = {
            links: {
                socials: [
                    'https://www.facebook.com/mybusiness',
                    'https://www.instagram.com/mycompany',
                    'https://x.com/twitterhandle',
                    'https://www.yelp.com/biz/my-business-name',
                    'https://www.linkedin.com/company/companyname',
                ],
                other: [],
            },
        }

        const result = transformSocialAccountsToDudaFormat(businessInfo as BusinessInfoData)

        expect(result).toEqual({
            facebook: 'mybusiness',
            instagram: 'mycompany',
            twitter: 'twitterhandle',
            yelp: 'my-business-name',
            linkedin: 'companyname',
        })
    })

    it('should handle empty social links', () => {
        const businessInfo: Partial<BusinessInfoData> = {
            links: {
                socials: [],
                other: [],
            },
        }
        const result = transformSocialAccountsToDudaFormat(businessInfo as BusinessInfoData)
        expect(result).toEqual({})
    })

    it('should handle missing social links', () => {
        const businessInfo: Partial<BusinessInfoData> = {}
        const result = transformSocialAccountsToDudaFormat(businessInfo as BusinessInfoData)
        expect(result).toEqual({})
    })

    it('should ignore unsupported social platforms', () => {
        const businessInfo: Partial<BusinessInfoData> = {
            links: {
                socials: ['https://www.facebook.com/mybusiness', 'https://unknown-platform.com/business'],
                other: [],
            },
        }
        const result = transformSocialAccountsToDudaFormat(businessInfo as BusinessInfoData)
        expect(result).toEqual({
            facebook: 'mybusiness',
        })
    })

    it('should handle invalid URLs', () => {
        const businessInfo: Partial<BusinessInfoData> = {
            links: {
                socials: ['https://www.facebook.com/mybusiness', 'invalid-url', 'https://www.instagram.com/'],
                other: [],
            },
        }
        const result = transformSocialAccountsToDudaFormat(businessInfo as BusinessInfoData)
        expect(result).toEqual({
            facebook: 'mybusiness',
        })
    })

    it('should handle URLs with query parameters', () => {
        const businessInfo: Partial<BusinessInfoData> = {
            links: {
                socials: [
                    'https://www.facebook.com/mybusiness?ref=page_internal',
                    'https://www.instagram.com/mycompany?igshid=123456',
                    'https://www.facebook.com/target?234343?user=josh',
                    'https://www.linkedin.com/company/mycompany?originalSubdomain=uk',
                ],
                other: [],
            },
        }
        const result = transformSocialAccountsToDudaFormat(businessInfo as BusinessInfoData)
        expect(result).toEqual({
            facebook: 'target',
            instagram: 'mycompany',
            linkedin: 'mycompany',
        })
    })

    it('should handle URLs with special characters', () => {
        const businessInfo: Partial<BusinessInfoData> = {
            links: {
                socials: [
                    'https://www.facebook.com/my.business.name',
                    'https://www.instagram.com/my_company_2023',
                    'https://www.linkedin.com/company/my-company!',
                ],
                other: [],
            },
        }
        const result = transformSocialAccountsToDudaFormat(businessInfo as BusinessInfoData)
        expect(result).toEqual({
            facebook: 'mybusinessname',
            instagram: 'my_company_2023',
            linkedin: 'my-company',
        })
    })
})
