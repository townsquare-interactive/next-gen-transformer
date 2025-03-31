import { describe, it, expect } from 'vitest'
import { savePagesToDuda, transformScrapedPageDataToDudaFormat } from './save-pages.ts'
import mockPageData from './mocks/mock-pages-array.json'
import { ScrapedAndAnalyzedSiteData } from '../../schema/output-zod.js'

type ScrapedPageData = ScrapedAndAnalyzedSiteData['pages'][number]

describe('savePagesToDuda', () => {
    it('should throw an error if the pageDataArray is not an array', async () => {
        const siteId = 'test-site-id'

        // Test with invalid data (non-array)
        const invalidData = { invalid: 'data' }

        await expect(savePagesToDuda(siteId, invalidData as unknown as ScrapedAndAnalyzedSiteData['pages'])).rejects.toThrow(
            'Expected an array of pages, but received object'
        )
    })
})

describe('transformScrapedPageDataToDudaFormat', () => {
    it('should transform a fully populated page correctly', () => {
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
            title: 'Aqua Pool & Spa | Custom Pools | Pool Hardscaping | New Martinsville, WV & Hannibal, OH',
            path: '/index',
        })
    })

    it('should handle missing SEO fields correctly by setting defaults', () => {
        const result = transformScrapedPageDataToDudaFormat(mockPageData[2] as ScrapedPageData)

        expect(result).toEqual({
            seo: {
                no_index: false,
                title: 'Contact Us | Aqua Pool & Spa',
                description: 'Have questions? Contact Aqua Pool & Spa today to discuss your custom pool needs. We’re happy to help!',
                og_image: '',
            },
            draft_status: 'STAGED_DRAFT',
            title: 'Contact Us | Aqua Pool & Spa',
            path: '/contact',
        })
    })
})
