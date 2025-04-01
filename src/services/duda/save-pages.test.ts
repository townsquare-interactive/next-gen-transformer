import { describe, it, expect } from 'vitest'
import { savePagesToDuda, transformScrapedPageDataToDudaFormat } from './save-pages.ts'
import mockPageData from './mocks/mock-pages-array.json'
import { ScrapedAndAnalyzedSiteData } from '../../schema/output-zod.js'

type ScrapedPageData = ScrapedAndAnalyzedSiteData['pages'][number]

describe('savePagesToDuda', () => {
    it('should throw an error when provided with a non-array page data object', async () => {
        const siteId = 'test-site-id'

        // Test with invalid data (non-array)
        const invalidData = { invalid: 'data' }

        await expect(savePagesToDuda(siteId, invalidData as unknown as ScrapedAndAnalyzedSiteData['pages'])).rejects.toThrow(
            'Expected an array of pages, but received object'
        )
    })
})

describe('transformScrapedPageDataToDudaFormat', () => {
    it('should correctly transform a fully populated page with all SEO fields and images', () => {
        const result = transformScrapedPageDataToDudaFormat(mockPageData[0] as ScrapedPageData)

        expect(result).toEqual({
            seo: {
                no_index: false,
                title: 'Aqua Pool & Spa | Custom Pools | Pool Hardscaping | New Martinsville, WV & Hannibal, OH',
                description:
                    'Aqua Pool & Spa provides custom pool installation services including concrete, fiberglass & vinyl pools. Serving New Martinsville, WV & Hannibal, OH. Call today!',
                og_image:
                    'https://aquapoolandspaoh.com/files/shutterstock/2023/11/1699373659636_shutterstock_316062692_1699373171_e1b44676722eb2c8eb7630f90d0a37024f.jpg?w=1600&h=2133',
            },
            draft_status: 'STAGED_DRAFT',
            title: 'Home',
            path: '/index',
        })
    })

    it('should strip file extensions from the page path when present', () => {
        const result = transformScrapedPageDataToDudaFormat(mockPageData[1] as ScrapedPageData)

        expect(result).toEqual({
            seo: {
                no_index: false,
                title: 'Our Pool Services | Aqua Pool & Spa',
                description:
                    'Explore our range of pool services, including custom pool construction, hardscaping, and pool maintenance. Contact us for a consultation!',
                og_image:
                    'https://aquapoolandspaoh.com/files/shutterstock/2023/11/shutterstock_613622132_1699545014_e1a3b5ae99e0e77bd06cfea271179a4410.jpg?w=1600&h=2133',
            },
            draft_status: 'STAGED_DRAFT',
            title: 'Services',
            path: '/services',
        })
    })

    it('should handle cases where no images are provided, setting og_image to an empty string', () => {
        const result = transformScrapedPageDataToDudaFormat(mockPageData[2] as ScrapedPageData)

        expect(result).toEqual({
            seo: {
                no_index: false,
                title: 'Contact Us | Aqua Pool & Spa',
                description: 'Have questions? Contact Aqua Pool & Spa today to discuss your custom pool needs. We’re happy to help!',
                og_image: '',
            },
            draft_status: 'STAGED_DRAFT',
            title: 'Contact Us',
            path: '/contact-us',
        })
    })
})
