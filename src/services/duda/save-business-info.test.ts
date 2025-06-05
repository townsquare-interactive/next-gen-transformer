import { describe, it, expect } from 'vitest'
import { transformBusinessInfoDataToDudaLocations, transformBusinessInfoDataToDudaFormat } from './save-business-info.ts'
import mockBusinessInfoObject from './mocks/mock-business-info-object.json'
import { ScrapedAndAnalyzedSiteData } from '../../schema/output-zod.js'
import { transformSocialAccountsToDudaFormat } from '../../api/scrapers/utils.js'

type BusinessInfoData = ScrapedAndAnalyzedSiteData['businessInfo']

describe('transformBusinessInfoDataToDudaLocation', () => {
    const logoUrl = 'https://example.com/logo.png'

    it('should transform business info to Duda format', () => {
        const result = transformBusinessInfoDataToDudaLocations(logoUrl, mockBusinessInfoObject, {})

        expect(result[0]).toEqual({
            label: 'June Foot Spa',
            phones: [{ phoneNumber: '(929) 566-7799', label: 'Phone' }],
            emails: [{ emailAddress: 'howareyoucolin@gmail.com', label: 'Email' }],
            address: {
                streetAddress: '149-36 Northern Blvd',
                city: 'Flushing',
                postalCode: '11354',
                country: 'US',
                region: '',
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
            schema: {
                type: 'HardwareStore',
            },
            social_accounts: {},
        })
    })

    it('should handle missing optional fields correctly', () => {
        const result = transformBusinessInfoDataToDudaLocations(logoUrl, {} as BusinessInfoData, {})

        expect(result[0]).toEqual({
            label: '',
            logo_url: logoUrl,
            social_accounts: {},
        })

        // Ensure that missing fields are explicitly undefined
        expect(result[0].phones).toBeUndefined()
        expect(result[0].emails).toBeUndefined()
        expect(result[0].address).toBeUndefined()
        expect(result[0].business_hours).toBeUndefined()
    })

    it('should transform alternate hours format to Duda format', () => {
        const result = transformBusinessInfoDataToDudaLocations(
            logoUrl,
            {
                ...mockBusinessInfoObject,
                hours: {
                    regularHours: {
                        MON: '9:00am to 11:00pm',
                        TUE: '9:00am to 11:00pm',
                        WED: '8:00am - 12:00am',
                        THU: '9:00am - 11:00pm',
                        FRI: '9:00am - 11:00pm',
                        SAT: '10am - 10pm',
                        SUN: '11am–9pm', //use en-dash
                    },
                    is24Hours: false,
                },
            },
            {}
        )

        expect(result[0]).toEqual({
            label: 'June Foot Spa',
            phones: [{ phoneNumber: '(929) 566-7799', label: 'Phone' }],
            emails: [{ emailAddress: 'howareyoucolin@gmail.com', label: 'Email' }],
            address: {
                streetAddress: '149-36 Northern Blvd',
                city: 'Flushing',
                postalCode: '11354',
                country: 'US',
                region: '',
            },
            logo_url: logoUrl,
            business_hours: [
                { days: ['MON'], open: '09:00', close: '23:00' },
                { days: ['TUE'], open: '09:00', close: '23:00' },
                { days: ['WED'], open: '08:00', close: '00:00' },
                { days: ['THU'], open: '09:00', close: '23:00' },
                { days: ['FRI'], open: '09:00', close: '23:00' },
                { days: ['SAT'], open: '10:00', close: '22:00' },
                { days: ['SUN'], open: '11:00', close: '21:00' },
            ],
            schema: {
                type: 'HardwareStore',
            },
            social_accounts: {},
        })
    })
    it('should transform handle 24/7 hours format to Duda format', () => {
        const result = transformBusinessInfoDataToDudaLocations(
            logoUrl,
            {
                ...mockBusinessInfoObject,
                hours: {
                    regularHours: {
                        MON: null,
                        TUE: null,
                        WED: null,
                        THU: null,
                        FRI: null,
                        SAT: null,
                        SUN: null,
                    },
                    is24Hours: true,
                },
            },
            {}
        )

        expect(result[0].business_hours).toEqual([{ days: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'], open: '00:00', close: '24:00' }])
    })

    it('should transform social accounts to duda format', () => {
        const result = transformBusinessInfoDataToDudaLocations(
            logoUrl,
            {
                ...mockBusinessInfoObject,
                links: {
                    socials: [
                        'https://www.facebook.com/mybusiness',
                        'https://www.instagram.com/mycompany?querytest?josh',
                        'https://x.com/twitterhandle',
                        'https://www.yelp.com/biz/my-business-name',
                        'https://www.linkedin.com/companyname',
                    ],
                    other: [],
                },
            },
            {
                facebook: 'mybusiness',
                instagram: 'mycompany',
                twitter: 'twitterhandle',
                yelp: 'biz/my-business-name',
                linkedin: 'companyname',
            }
        )
        expect(result[0].social_accounts).toEqual({
            facebook: 'mybusiness',
            instagram: 'mycompany',
            twitter: 'twitterhandle',
            yelp: 'biz/my-business-name',
            linkedin: 'companyname',
        })
    })
    const currentBusinessInfo = {
        //current info form duda
        location_data: {
            label: 'June Foot Spa',
            phones: [{ phoneNumber: '(929) 566-7799', label: 'Phone' }],
            emails: [{ emailAddress: 'howareyoucolin2@gmail.com', label: 'Email' }],
            uuid: '123',
            address: {
                streetAddress: '',
                city: 'Flushing',
                postalCode: '11354',
                country: 'US',
            },
            social_accounts: {
                socialAccounts: {
                    facebook: '',
                    instagram: 'mycompany',
                    yelp: 'my-business-name',
                    linkedin: 'companyname',
                },
            },
            business_hours: [
                { days: ['MON' as const], open: '09:00', close: '23:00' },
                { days: ['TUE' as const], open: '09:00', close: '23:00' },
                { days: ['WED' as const], open: '08:00', close: '00:00' },
                { days: ['THU' as const], open: '09:00', close: '23:00' },
                { days: ['FRI' as const], open: '09:00', close: '23:00' },
            ],
            address_geolocation: '',
            geo: {
                longitude: '',
                latitude: '',
            },
            logo_url: logoUrl,
        },
        business_data: {
            name: 'June Foot Spa',
            logo_url: logoUrl,
            data_controller: 'June Foot Spa',
        },
        site_texts: {
            overview: '',
            services: '',
            about_us: '',
            custom: [],
        },
        site_images: [],
    }
    it('should handle merging locations with the same phone/address', () => {
        const result = transformBusinessInfoDataToDudaLocations(
            logoUrl,
            {
                ...mockBusinessInfoObject,
                address: {
                    streetAddress: '149-36 Northern Blvd',
                    city: 'Flushing',
                    postalCode: '11354',
                    country: 'US',
                },
                links: {
                    socials: ['https://www.facebook.com/newbusiness', 'https://www.instagram.com/mycompany', 'https://x.com/twitterhandle'],
                    other: [],
                },
                phoneNumber: '(929)5667799',
                email: 'howareyoucolin@gmail.com',
                hours: {
                    regularHours: {
                        MON: '3:00am to 2:00pm' as const,
                        TUE: '9:00am to 11:00pm' as const,
                        WED: '8:00am - 12:00am' as const,
                        THU: '9:00am - 11:00pm' as const,
                        FRI: '9:00am - 11:00pm' as const,
                        SAT: null,
                        SUN: null,
                    },
                    is24Hours: false,
                },
            },
            {
                facebook: 'newbusiness',
                instagram: 'mycompany',
                twitter: 'twitterhandle',
                yelp: 'my-business-name',
                linkedin: 'companyname',
            },
            currentBusinessInfo
        )

        //only have one location (matching addresses)
        expect(result.length).toEqual(1)

        //overwrite only blank social accounts, merge others
        expect(result[0].social_accounts).toEqual({
            facebook: 'newbusiness',
            instagram: 'mycompany',
            twitter: 'twitterhandle',
            yelp: 'my-business-name',
            linkedin: 'companyname',
        })

        expect(result[0].address).toEqual({
            streetAddress: '149-36 Northern Blvd',
            city: 'Flushing',
            postalCode: '11354',
            country: 'US',
            region: '',
        })

        //keep one phone
        expect(result[0].phones?.length).toEqual(1)
        expect(result[0].phones).toEqual([{ phoneNumber: '(929) 566-7799', label: 'Phone' }])

        //add it email if not present
        expect(result[0].emails?.length).toEqual(1)
        expect(result[0].emails).toEqual([{ emailAddress: 'howareyoucolin2@gmail.com', label: 'Email' }])

        //keep current hours
        expect(result[0].business_hours).toEqual([
            { days: ['MON'], open: '09:00', close: '23:00' },
            { days: ['TUE'], open: '09:00', close: '23:00' },
            { days: ['WED'], open: '08:00', close: '00:00' },
            { days: ['THU'], open: '09:00', close: '23:00' },
            { days: ['FRI'], open: '09:00', close: '23:00' },
        ])
    })
    it('should handle adding a second location when necessary', () => {
        const result = transformBusinessInfoDataToDudaLocations(
            logoUrl,
            {
                ...mockBusinessInfoObject,
                address: {
                    streetAddress: 'Different address',
                    city: 'Flushing',
                    postalCode: '11354',
                    country: 'US',
                    state: 'NY',
                },
                links: {
                    socials: ['https://www.facebook.com/newbusiness', 'https://www.instagram.com/mycompany', 'https://x.com/twitterhandle'],
                    other: [],
                },
                phoneNumber: '323-222-2222',
                email: 'howareyoucolin@gmail.com',
                hours: {
                    regularHours: {
                        MON: '3:00am to 2:00pm' as const,
                        TUE: '9:00am to 11:00pm' as const,
                        WED: '8:00am - 12:00am' as const,
                        THU: '9:00am - 11:00pm' as const,
                        FRI: '9:00am - 11:00pm' as const,
                        SAT: null,
                        SUN: null,
                    },
                    is24Hours: false,
                },
            },
            {},
            {
                ...currentBusinessInfo,
                location_data: {
                    ...currentBusinessInfo.location_data,
                    address: { ...currentBusinessInfo.location_data.address, streetAddress: '149-36 Northern Blvd' },
                },
            }
        )

        //only have one location (matching addresses)
        expect(result.length).toEqual(2)

        expect(result[0].address).toEqual({
            streetAddress: '149-36 Northern Blvd',
            city: 'Flushing',
            postalCode: '11354',
            country: 'US',
            region: '',
        })

        //keep one phone
        expect(result[0].phones?.length).toEqual(1)
        expect(result[0].phones).toEqual([{ phoneNumber: '(929) 566-7799', label: 'Phone' }])

        //add it email if not present
        expect(result[0].emails?.length).toEqual(1)
        expect(result[0].emails).toEqual([{ emailAddress: 'howareyoucolin2@gmail.com', label: 'Email' }])

        //keep current hours
        expect(result[0].business_hours).toEqual([
            { days: ['MON'], open: '09:00', close: '23:00' },
            { days: ['TUE'], open: '09:00', close: '23:00' },
            { days: ['WED'], open: '08:00', close: '00:00' },
            { days: ['THU'], open: '09:00', close: '23:00' },
            { days: ['FRI'], open: '09:00', close: '23:00' },
        ])

        //second location data
        expect(result[1].address).toEqual({
            streetAddress: 'Different address',
            city: 'Flushing',
            postalCode: '11354',
            country: 'US',
            region: 'NY',
        })
        expect(result[1].phones).toEqual([{ phoneNumber: '323-222-2222', label: 'Phone' }])
        expect(result[1].business_hours).toEqual([
            { days: ['MON'], open: '03:00', close: '14:00' },
            { days: ['TUE'], open: '09:00', close: '23:00' },
            { days: ['WED'], open: '08:00', close: '00:00' },
            { days: ['THU'], open: '09:00', close: '23:00' },
            { days: ['FRI'], open: '09:00', close: '23:00' },
        ])
    })
    it('should not add a second location when address is similar', () => {
        const result = transformBusinessInfoDataToDudaLocations(
            logoUrl,
            {
                ...mockBusinessInfoObject,
                address: {
                    streetAddress: '',
                    city: 'Flushing',
                    postalCode: '11354',
                    country: 'US',
                },
            },
            {},
            {
                ...currentBusinessInfo,
                location_data: {
                    ...currentBusinessInfo.location_data,
                    address: { ...currentBusinessInfo.location_data.address, streetAddress: '' },
                },
            }
        )

        //only have one location (matching addresses)
        expect(result.length).toEqual(1)

        expect(result[0].address).toEqual({
            streetAddress: '',
            city: 'Flushing',
            postalCode: '11354',
            country: 'US',
            region: '',
        })
    })
    it('should replace flawed location with full in primary location', () => {
        const result = transformBusinessInfoDataToDudaLocations(
            logoUrl,
            {
                ...mockBusinessInfoObject,
                address: {
                    streetAddress: '',
                    city: 'Flushing',
                    postalCode: '11354',
                    country: 'US',
                },
            },
            {},
            {
                ...currentBusinessInfo,
                location_data: {
                    ...currentBusinessInfo.location_data,
                    address: {
                        streetAddress: '1234 Main St',
                        city: 'Charlotte',
                        postalCode: '28204',
                        country: 'US',
                    },
                },
            }
        )

        //only have one location (matching addresses)
        expect(result.length).toEqual(1)

        expect(result[0].address).toEqual({
            streetAddress: '1234 Main St',
            city: 'Charlotte',
            postalCode: '28204',
            country: 'US',
            region: '',
        })
    })
    it('should handle one location with no current info', () => {
        const result = transformBusinessInfoDataToDudaLocations(
            logoUrl,
            {
                ...mockBusinessInfoObject,
                address: {
                    streetAddress: '123 Main St',
                    city: 'Flushing',
                    postalCode: '11354',
                    country: 'US',
                    state: 'NY',
                },
                links: {
                    socials: ['https://www.facebook.com/newbusiness', 'https://www.instagram.com/mycompany', 'https://x.com/twitterhandle'],
                    other: [],
                },
                phoneNumber: '323-222-2222',
                email: 'company@company.com',
                hours: {
                    regularHours: {
                        MON: '3:00am to 2:00pm' as const,
                        TUE: '9:00am to 11:00pm' as const,
                        WED: '8:00am - 12:00am' as const,
                        THU: '9:00am - 11:00pm' as const,
                        FRI: '9:00am - 11:00pm' as const,
                        SAT: null,
                        SUN: null,
                    },
                    is24Hours: false,
                },
            },
            {
                facebook: 'newbusiness',
                instagram: 'mycompany',
                twitter: 'twitterhandle',
            }
        )

        //only have one location (matching addresses)
        expect(result.length).toEqual(1)

        //overwrite only blank social accounts, merge others
        expect(result[0].social_accounts).toEqual({
            facebook: 'newbusiness',
            instagram: 'mycompany',
            twitter: 'twitterhandle',
        })

        expect(result[0].address).toEqual({
            streetAddress: '123 Main St',
            city: 'Flushing',
            postalCode: '11354',
            country: 'US',
            region: 'NY',
        })

        //keep one phone
        expect(result[0].phones?.length).toEqual(1)
        expect(result[0].phones).toEqual([{ phoneNumber: '323-222-2222', label: 'Phone' }])

        //add it email if not present
        expect(result[0].emails?.length).toEqual(1)
        expect(result[0].emails).toEqual([{ emailAddress: 'company@company.com', label: 'Email' }])

        //keep current hours
        expect(result[0].business_hours).toEqual([
            { days: ['MON'], open: '03:00', close: '14:00' },
            { days: ['TUE'], open: '09:00', close: '23:00' },
            { days: ['WED'], open: '08:00', close: '00:00' },
            { days: ['THU'], open: '09:00', close: '23:00' },
            { days: ['FRI'], open: '09:00', close: '23:00' },
        ])
    })
    it('should handle one location with undefined fields in current info', () => {
        const result = transformBusinessInfoDataToDudaLocations(
            logoUrl,
            {
                ...mockBusinessInfoObject,
                businessType: 'Random',
                address: {
                    streetAddress: '123 Main St',
                    city: 'Flushing',
                    postalCode: '11354',
                    state: 'NY',
                    country: 'US',
                },
                links: {
                    socials: ['https://www.facebook.com/newbusiness', 'https://www.instagram.com/mycompany', 'https://x.com/twitterhandle'],
                    other: [],
                },
                phoneNumber: '323-222-2222',
                email: 'company@company.com',
                hours: {
                    regularHours: {
                        MON: '3:00am to 2:00pm' as const,
                        TUE: '9:00am to 11:00pm' as const,
                        WED: '8:00am - 12:00am' as const,
                        THU: '9:00am - 11:00pm' as const,
                        FRI: '9:00am - 11:00pm' as const,
                        SAT: null,
                        SUN: null,
                    },
                    is24Hours: false,
                },
            },
            {
                facebook: 'newbusiness',
                instagram: 'mycompany',
                twitter: 'twitterhandle',
            },
            {
                //current info form duda
                location_data: {
                    label: '',
                    phones: [],
                    emails: [],
                    uuid: '123',
                    address: {
                        streetAddress: '',
                        city: '',
                        postalCode: '',
                        country: 'US',
                    },
                    social_accounts: {
                        socialAccounts: {},
                    },
                    business_hours: [],
                    address_geolocation: '',
                    geo: {
                        longitude: '',
                        latitude: '',
                    },
                    logo_url: logoUrl,
                },
                business_data: {
                    name: '',
                    logo_url: '',
                    data_controller: '',
                },
                site_texts: {
                    overview: '',
                    services: '',
                    about_us: '',
                    custom: [],
                },
                site_images: [],
            }
        )

        //only have one location (matching addresses)
        expect(result.length).toEqual(1)

        //overwrite only blank social accounts, merge others
        expect(result[0].social_accounts).toEqual({
            facebook: 'newbusiness',
            instagram: 'mycompany',
            twitter: 'twitterhandle',
        })

        expect(result[0].address).toEqual({
            streetAddress: '123 Main St',
            city: 'Flushing',
            postalCode: '11354',
            country: 'US',
            region: 'NY',
        })

        //incorrect schema passed does not add schema to location
        expect(result[0].schema).toBeUndefined()

        //keep one phone
        expect(result[0].phones?.length).toEqual(1)
        expect(result[0].phones).toEqual([{ phoneNumber: '323-222-2222', label: 'Phone' }])

        //add it email if not present
        expect(result[0].emails?.length).toEqual(1)
        expect(result[0].emails).toEqual([{ emailAddress: 'company@company.com', label: 'Email' }])

        //keep current hours
        expect(result[0].business_hours).toEqual([
            { days: ['MON'], open: '03:00', close: '14:00' },
            { days: ['TUE'], open: '09:00', close: '23:00' },
            { days: ['WED'], open: '08:00', close: '00:00' },
            { days: ['THU'], open: '09:00', close: '23:00' },
            { days: ['FRI'], open: '09:00', close: '23:00' },
        ])

        expect(result[0].logo_url).toEqual(logoUrl)
        expect(result[0].label).toEqual('June Foot Spa')
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
            region: '',
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
            { content: 'check stuff⌛🌟🌐\n', url: 'https://example.com/page1', images: [], forms: [], title: 'June Foot Spa' },
            { content: 'page 2 content', url: 'https://example.com/page2', images: [], forms: [], title: 'June Page 2' },
        ]
        const result = transformBusinessInfoDataToDudaFormat(
            logoUrl,
            mockBusinessInfoObject,
            pages,
            dudaLocationData,
            [],
            ['<iframe src="https://www.google.com"></iframe>'],
            [{ src: 'https://www.google.com', pageTitle: 'June Foot Spa' }]
        )

        const transformedResultCheck = {
            companyName: 'June Foot Spa',
            site_texts: {
                custom: [
                    { label: 'June Foot Spa: https://example.com/page1', text: 'check stuff<br>' }, //remove emojis
                    { label: 'June Page 2: https://example.com/page2', text: 'page 2 content' },
                    { label: 'Fonts', text: 'Header Fonts: Arial, Helvetica<br><br>Body Fonts: Arial, Helvetica' },
                    {
                        label: 'Media Files',
                        text: '<h3>Files</h3><br>https://www.google.com<br><br><h3>Iframe Content</h3><br>&lt;iframe src=&quot;https://www.google.com&quot;&gt;&lt;/iframe&gt;',
                    },
                    {
                        label: 'Address',
                        text: '149-36 Northern Blvd<br>Flushing, <br>11354',
                    },
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
    it('should handle null fonts and content without error', () => {
        const logoUrl = 'https://example.com/logo.png'

        const pages = [{ content: null, url: 'https://example.com/page1', images: [], forms: [], title: 'June Foot Spa' }]
        const result = transformBusinessInfoDataToDudaFormat(
            logoUrl,
            { ...mockBusinessInfoObject, styles: { fonts: null, colors: null } },
            pages,
            dudaLocationData,
            [],
            [],
            []
        )

        const transformedResultCheck = {
            companyName: 'June Foot Spa',
            site_texts: {
                custom: [
                    {
                        label: 'Address',
                        text: '149-36 Northern Blvd<br>Flushing, <br>11354',
                    },
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

        expect(result.socialAccounts).toEqual({
            facebook: 'mybusiness',
            instagram: 'mycompany',
            twitter: 'twitterhandle',
            yelp: 'biz/my-business-name',
            linkedin: 'company/companyname',
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
        expect(result.socialAccounts).toEqual({})
    })

    it('should handle missing social links', () => {
        const businessInfo: Partial<BusinessInfoData> = {}
        const result = transformSocialAccountsToDudaFormat(businessInfo as BusinessInfoData)
        expect(result.socialAccounts).toEqual({})
    })

    it('should ignore unsupported social platforms', () => {
        const businessInfo: Partial<BusinessInfoData> = {
            links: {
                socials: ['https://www.facebook.com/mybusiness', 'https://unknown-platform.com/business'],
                other: [],
            },
        }
        const result = transformSocialAccountsToDudaFormat(businessInfo as BusinessInfoData)
        expect(result.socialAccounts).toEqual({
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
        expect(result.socialAccounts).toEqual({
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
                    '',
                ],
                other: [],
            },
        }
        const result = transformSocialAccountsToDudaFormat(businessInfo as BusinessInfoData)
        expect(result.socialAccounts).toEqual({
            facebook: 'target',
            instagram: 'mycompany',
            linkedin: 'company/mycompany',
        })
    })
    it('should handle URLs with query parameters', () => {
        const businessInfo: Partial<BusinessInfoData> = {
            links: {
                socials: ['https://www.facebook.com/people/kyle/233234', ''],
                other: [],
            },
        }
        const result = transformSocialAccountsToDudaFormat(businessInfo as BusinessInfoData)
        expect(result.socialAccounts).toEqual({
            facebook: 'people/kyle/233234',
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
        expect(result.socialAccounts).toEqual({
            facebook: 'mybusinessname',
            instagram: 'my_company_2023',
            linkedin: 'company/my-company',
        })
    })

    it('should handle google my business in the other links list', () => {
        const businessInfo: Partial<BusinessInfoData> = {
            links: {
                socials: [],
                other: ['https://www.google.com/maps/place/Josh+Co./@33.3908482,-94.239245'],
            },
        }

        const result = transformSocialAccountsToDudaFormat(businessInfo as BusinessInfoData)

        expect(result.socialAccounts).toEqual({
            google_my_business: 'Josh+Co./@33.3908482,-94.239245',
        })
        expect(result.skippedLinks).toEqual([])
    })
    it('should skip URLs that are too long and add to skippedLinks', () => {
        const longUrl =
            'https://www.google.com/maps/place/Passion+Nails+and+Spas/@33.939385,-117.9693012,1645m/data=!3m2!1e3!4b1!4m6!3m5!1s0x80c2d5285d200529:0x7ccdab2f72ef8a4d!8m2!3d33.939385!4d-117.9693012!16s%2Fg%2F1tcv1qfw?entry=ttu&g_ep=EgoyMDI1MDEwOC4wIKXMDSoASAFQAw%3D%3D'
        const businessInfo: Partial<BusinessInfoData> = {
            links: {
                socials: [],
                other: [longUrl],
            },
        }

        const result = transformSocialAccountsToDudaFormat(businessInfo as BusinessInfoData)

        expect(result.socialAccounts).toEqual({})
        expect(result.skippedLinks).toEqual([longUrl])
    })
})
