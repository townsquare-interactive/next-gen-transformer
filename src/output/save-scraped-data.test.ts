import { describe, it, expect, vi } from 'vitest'
import { save } from './save-scraped-data.js'
import type { ScrapedAndAnalyzedSiteData } from '../schema/output-zod.js'
import type { ImageFiles } from '../../api/scrapers/asset-scrape.js'
import { Settings } from '../controllers/scrape-controller.js'

describe('save', () => {
    it('should handle s3 upload with mock functions', async () => {
        const mockImageFiles: ImageFiles[] = [
            {
                url: new URL('http://example.com/image.jpg'),
                imageFileName: 'test-image.jpg',
                fileContents: Buffer.from('mock-image-data'),
                hashedFileName: 'test-image.jpg',
                originalImageLink: 'http://example.com/image.jpg',
                fileExtension: 'jpg',
            },
        ]

        const mockSiteData: ScrapedAndAnalyzedSiteData = {
            pages: [],
            baseUrl: 'http://example.com/image.jpg',
            dudaUploadLocation: '',
            assetData: {
                s3UploadedImages: ['https://s3.example.com/image.jpg'],
                s3LogoUrl: '',
            },
        }

        const mockScrapedData = {
            imageNames: [],
            url: 'http://example.com',
            imageFiles: mockImageFiles,
            siteData: mockSiteData,
        }

        const mockImageUpload = vi.fn().mockResolvedValue('https://s3.example.com/image.jpg')

        const mockSiteDataUpload = vi.fn().mockReturnValue('https://s3.example.com/site-data.json')

        const settings: Settings = {
            saveImages: true,
            saveMethod: 's3Upload',
            backupImagesSave: true,
            basePath: 'http://example.com',
            url: 'http://example.com/image.jpg',
            analyzeHomepageData: true,
        }
        //
        const result = await save(settings, mockScrapedData, {
            imageUploadFunction: mockImageUpload,
            siteDataUploadFunction: mockSiteDataUpload,
        })

        expect(result).toHaveProperty('dataUploadDetails')
        expect(result.dataUploadDetails?.imageUploadTotal).toBe(1)
        expect(result.dataUploadDetails?.failedImageCount).toBe(0)
        expect(result.dataUploadDetails?.uploadedResources).toHaveLength(1)
        expect(result.dataUploadDetails?.failedImages).toHaveLength(0)
        expect(result.dataUploadDetails?.s3UploadedImages).toHaveLength(1)
        expect(result.dataUploadDetails?.siteDataUrl).toBe('https://s3.example.com/site-data.json')
        expect(result.url).toBe('http://example.com')
        expect(result.siteData).toStrictEqual(mockSiteData)
    })

    it('should skip image upload when saveImages is false', async () => {
        const settings: Settings = {
            saveImages: false,
            saveMethod: 's3Upload',
            basePath: 'http://example.com',
            url: 'http://example.com/image.jpg',
            analyzeHomepageData: true,
        }

        const mockImageFiles: ImageFiles[] = [
            {
                url: new URL('http://example.com/image.jpg'),
                imageFileName: 'test-image.jpg',
                fileContents: Buffer.from('mock-image-data'),
                hashedFileName: 'test-image.jpg',
                originalImageLink: 'http://example.com/image.jpg',
                fileExtension: 'jpg',
            },
        ]

        const mockSiteData: ScrapedAndAnalyzedSiteData = {
            pages: [],
            baseUrl: 'http://example.com/image.jpg',
            dudaUploadLocation: '',
        }

        const mockScrapedData = {
            imageNames: [],
            url: 'http://example.com',
            imageFiles: mockImageFiles,
            siteData: mockSiteData,
        }

        const result = await save(settings, mockScrapedData)

        expect(result).toEqual({
            message: 'Scrape complete: no images uploaded',
            scrapedPages: mockSiteData.pages,
            url: 'http://example.com',
        })
    })

    it('should handle Duda upload with mock functions', async () => {
        const mockImageFiles: ImageFiles[] = [
            {
                url: new URL('http://example.com/image.jpg'),
                imageFileName: 'test-image.jpg',
                fileContents: Buffer.from('mock-image-data'),
                hashedFileName: 'test-image.jpg',
                originalImageLink: 'http://example.com/image.jpg',
                fileExtension: 'jpg',
            },
        ]

        const mockSiteData: ScrapedAndAnalyzedSiteData = {
            pages: [],
            baseUrl: 'http://example.com/image.jpg',
            dudaUploadLocation: '12321',
        }

        const mockScrapedData = {
            imageNames: [],
            url: 'http://example.com',
            imageFiles: mockImageFiles,
            siteData: mockSiteData,
        }

        const mockDudaResponse = {
            uploaded_resources: [
                {
                    url: 'https://example.com/image1.png',
                    id: '12345',
                    original_url: 'http://example.com/image.jpg',
                    new_url: 'https://irt-cdn.multiscreensite.com/image1.png',
                    status: 'UPLOADED',
                },
            ],
        }

        const mockImageUpload = vi.fn().mockResolvedValue(mockDudaResponse)
        const mockSiteDataUpload = vi.fn().mockReturnValue('https://s3.example.com/site-data.json')

        const settings: Settings = {
            saveImages: true,
            saveMethod: 'dudaUpload',
            uploadLocation: '12321',
            backupImagesSave: false,
            basePath: 'http://example.com',
            url: 'http://example.com/image.jpg',
            analyzeHomepageData: true,
        }

        const result = await save(settings, mockScrapedData, {
            imageUploadFunction: mockImageUpload,
            siteDataUploadFunction: mockSiteDataUpload,
        })

        expect(result).toHaveProperty('dataUploadDetails')
        expect(result.dataUploadDetails?.imageUploadTotal).toBe(1)
        expect(result.dataUploadDetails?.failedImageCount).toBe(0)
        expect(result.dataUploadDetails?.uploadedResources).toEqual(mockDudaResponse.uploaded_resources)
        expect(result.url).toBe('http://example.com')
        expect(result.siteData).toBe(mockSiteData)
    })

    it('should handle Duda upload with backup to S3', async () => {
        const mockImageFiles: ImageFiles[] = [
            {
                url: new URL('http://example.com/image.jpg'),
                imageFileName: 'test-image.jpg',
                fileContents: Buffer.from('mock-image-data'),
                hashedFileName: 'test-image.jpg',
                originalImageLink: 'http://example.com/image.jpg',
                fileExtension: 'jpg',
            },
        ]

        const mockSiteData: ScrapedAndAnalyzedSiteData = {
            pages: [],
            baseUrl: 'http://example.com/image.jpg',
            dudaUploadLocation: '12321',
        }

        const mockScrapedData = {
            imageNames: [],
            url: 'http://example.com',
            imageFiles: mockImageFiles,
            siteData: mockSiteData,
        }

        const mockS3ImageResponse = 'https://example.com/image1.png'
        const mockDudaResponse = {
            uploaded_resources: [
                {
                    src: 'https://example.com/image1.png',
                    status: 'UPLOADED',
                },
            ],
        }

        const mockS3Response = {
            url: 'https://s3.example.com/image.jpg',
        }

        const mockImageUpload = vi
            .fn()
            .mockImplementationOnce(() => mockS3ImageResponse)
            .mockImplementationOnce(() => mockDudaResponse)
        const mockS3Upload = vi.fn().mockResolvedValue(mockS3Response)

        const settings: Settings = {
            saveImages: true,
            saveMethod: 'dudaUpload',
            uploadLocation: '12321',
            backupImagesSave: true,
            basePath: 'http://example.com',
            url: 'http://example.com/image.jpg',
            analyzeHomepageData: true,
        }

        const result = await save(settings, mockScrapedData, {
            imageUploadFunction: mockImageUpload,
            siteDataUploadFunction: mockS3Upload,
        })

        expect(result.dataUploadDetails?.s3UploadedImages).toBeDefined()
        expect(result.dataUploadDetails?.uploadedResources).toEqual(mockDudaResponse.uploaded_resources)
        expect(mockImageUpload).toHaveBeenCalledTimes(2)
        expect(mockS3Upload).toHaveBeenCalled()
    })
})
