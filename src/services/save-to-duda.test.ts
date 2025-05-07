import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { save } from './save-to-duda.js'
import { ScrapingError } from '../utilities/errors.js'

describe('save', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.restoreAllMocks()
    })

    afterEach(() => {
        vi.resetAllMocks()
    })

    it('should throw an error when no uploadLocation is not provided instantly', async () => {
        const mockS3ImageResponse = 'https://example.com/image1.png'
        const mockImageUpload = vi.fn().mockImplementationOnce(() => mockS3ImageResponse)
        const mockSeoUpload = vi.fn().mockResolvedValue({})

        const functions = {
            imageUploadFunction: mockImageUpload,
            seoUploadFunction: mockSeoUpload,
        }

        const settings = { url: 'scrapedsite.com', basePath: 'scrapedSite' }

        const mockSiteData = {
            pages: [],
            baseUrl: 'http://example.com/image.jpg',
            dudaUploadLocation: '12321',
        }

        let error
        try {
            await save({ settings, imageFiles: [], imageList: [], siteData: mockSiteData, logoUrl: '', functions })
        } catch (err) {
            error = err
        }

        expect(error).toBeInstanceOf(ScrapingError)
        expect(error.errorType).toEqual(`SCR-012`)
    })
})
