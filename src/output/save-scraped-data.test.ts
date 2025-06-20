import { describe, it, expect, vi } from 'vitest'
import { save } from './save-scraped-data.js'
import type { ScrapedAndAnalyzedSiteData } from '../schema/output-zod.js'
import type { ImageFiles } from '../api/scrapers/asset-scrape.js'
import { Settings } from '../services/scrape-service.js'

const mockBusinessInfo = {
    businessType: 'NailSalon',
    styles: {
        colors: {
            primaryColor: '#000000',
            secondaryColor: '#FFFFFF',
            tertiaryColor: '#000000',
            textColor: '#000000',
            mainContentBackgroundColor: '#FFFFFF',
        },
        fonts: {
            headerFonts: ['Arial', 'Helvetica', 'sans-serif'],
            bodyFonts: ['Arial', 'Helvetica', 'sans-serif'],
        },
    },
    companyName: 'Test Company',
    address: {
        streetAddress: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        postalCode: '12345',
    },
    phoneNumber: '123-456-7890',
    email: 'test@example.com',
    hours: null,
    links: { socials: [], other: [] },
}

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
                pageTitle: 'Home',
            },
            {
                url: new URL('http://example.com/image2.jpg'),
                imageFileName: 'test-image2.jpg',
                fileContents: Buffer.from('mock-image-data'),
                hashedFileName: 'test-image2.jpg',
                originalImageLink: 'http://example.com/image2.jpg',
                fileExtension: 'jpg',
                pageTitle: 'Home',
            },
            {
                url: new URL('http://example.com/video.mp4'),
                imageFileName: 'test-video.mp4',
                fileContents: Buffer.from('mock-video-data'),
                hashedFileName: 'test-video.mp4',
                originalImageLink: 'http://example.com/video.mp4',
                fileExtension: 'mp4',
                pageTitle: 'Home',
                type: 'video',
            },
        ]

        const mockSiteDataResult: ScrapedAndAnalyzedSiteData = {
            pages: [],
            baseUrl: 'http://example.com/image.jpg',
            dudaUploadLocation: '',
            assetData: {
                s3UploadedImages: [
                    { src: 'https://s3.example.com/image.jpg', pageTitle: 'Home' },
                    { src: 'https://s3.example.com/image2.jpg', pageTitle: 'Home' },
                ],
                s3LogoUrl: '',
                s3MediaFiles: [{ src: 'https://s3.example.com/video.mp4', pageTitle: 'Home' }],
            },
            businessInfo: mockBusinessInfo,
        }

        const mockSiteData: ScrapedAndAnalyzedSiteData = {
            pages: [],
            baseUrl: 'http://example.com/image.jpg',
            dudaUploadLocation: '',
            businessInfo: mockBusinessInfo,
        }

        const mockScrapedData = {
            imageNames: [],
            url: 'http://example.com',
            imageFiles: mockImageFiles,
            siteData: mockSiteData,
        }

        const mockImageUpload = vi
            .fn()
            .mockImplementationOnce(() => 'https://s3.example.com/image.jpg')
            .mockImplementationOnce(() => 'https://s3.example.com/image2.jpg')
            .mockImplementationOnce(() => 'https://s3.example.com/video.mp4')

        const mockSiteDataUpload = vi.fn().mockReturnValue('https://s3.example.com/site-data.json')
        const mockSeoUpload = vi.fn().mockResolvedValue({})

        const settings: Settings = {
            saveImages: true,
            saveMethod: 's3Upload',
            backupImagesSave: true,
            basePath: 'http://example.com',
            url: 'http://example.com/image.jpg',
            siteType: 'priority',
        }
        //
        const result = await save(settings, mockScrapedData, {
            imageUploadFunction: mockImageUpload,
            siteDataUploadFunction: mockSiteDataUpload,
            seoUploadFunction: mockSeoUpload,
        })

        expect(result).toHaveProperty('dataUploadDetails')
        expect(result.dataUploadDetails?.imageUploadTotal).toBe(2)
        expect(result.dataUploadDetails?.failedImageCount).toBe(0)
        expect(result.dataUploadDetails?.uploadedResources).toHaveLength(2)
        expect(result.dataUploadDetails?.failedImages).toHaveLength(0)
        expect(result.dataUploadDetails?.s3UploadedImages).toHaveLength(2)
        expect(result.dataUploadDetails?.siteDataUrl).toBe('https://s3.example.com/site-data.json')
        expect(result.url).toBe('http://example.com')
        expect(result.siteData).toStrictEqual(mockSiteDataResult)
        expect(mockSiteDataUpload).toHaveBeenCalledTimes(2)

        //expect the business info doc to be created and uploaded
        const secondCallArgs = mockSiteDataUpload.mock.calls[1]
        const content = secondCallArgs[0]
        expect(content).toContain('Company Name: Test Company')
        expect(content).toContain('Phone:   123-456-7890')
        expect(content).toContain('Email:   test@example.com')
        expect(content).toContain('Street:  123 Main St')
        expect(content).toContain('City:    Anytown')
        expect(content).toContain('State:   CA')
    })

    it('should skip image upload when saveImages is false', async () => {
        const settings: Settings = {
            saveImages: false,
            saveMethod: 's3Upload',
            basePath: 'http://example.com',
            url: 'http://example.com/image.jpg',
            siteType: 'priority',
        }

        const mockImageFiles: ImageFiles[] = [
            {
                url: new URL('http://example.com/image.jpg'),
                imageFileName: 'test-image.jpg',
                fileContents: Buffer.from('mock-image-data'),
                hashedFileName: 'test-image.jpg',
                originalImageLink: 'http://example.com/image.jpg',
                fileExtension: 'jpg',
                pageTitle: 'Home',
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
                pageTitle: 'Home',
            },
        ]

        const mockSiteData: ScrapedAndAnalyzedSiteData = {
            pages: [],
            baseUrl: 'http://example.com/image.jpg',
            dudaUploadLocation: '12321',
            businessInfo: mockBusinessInfo,
            siteSeo: {
                title: 'Test Company',
                metaDescription: 'Test Description',
                metaKeywords: 'test, company, test company',
                pageUrl: 'http://example.com',
            },
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
        const mockSeoUpload = vi.fn().mockResolvedValue({})
        const mockUploadColors = vi.fn().mockResolvedValue({})
        const mockUploadBusinessInfo = vi.fn().mockResolvedValue(false)

        const settings: Settings = {
            saveImages: true,
            saveMethod: 'dudaUpload',
            uploadLocation: '12321',
            backupImagesSave: false,
            basePath: 'http://example.com',
            url: 'http://example.com/image.jpg',
            siteType: 'priority',
        }

        const result = await save(settings, mockScrapedData, {
            imageUploadFunction: mockImageUpload,
            siteDataUploadFunction: mockSiteDataUpload,
            seoUploadFunction: mockSeoUpload,
            saveColorsToDudaFunction: mockUploadColors,
            saveBusinessInfoToDudaFunction: mockUploadBusinessInfo,
        })

        //mock functions to be called with correct arguments
        expect(mockImageUpload).toHaveBeenCalled()
        expect(mockUploadColors).toHaveBeenCalledWith(settings.uploadLocation, mockBusinessInfo.styles.colors)
        expect(mockSeoUpload).toHaveBeenCalledWith(settings.uploadLocation, mockSiteData.siteSeo, false)
        expect(mockUploadBusinessInfo).toHaveBeenCalledWith(settings.uploadLocation, '', mockSiteData, mockSiteData.pages, settings)

        //returned upload data
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
                pageTitle: 'Home',
            },
        ]

        const mockSiteData: ScrapedAndAnalyzedSiteData = {
            pages: [],
            baseUrl: 'http://example.com/image.jpg',
            dudaUploadLocation: '12321',
            businessInfo: mockBusinessInfo,
            siteSeo: {
                title: 'Test Company',
                metaDescription: 'Test Description',
                metaKeywords: 'test, company, test company',
                pageUrl: 'http://example.com',
            },
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
        const mockSeoUpload = vi.fn().mockResolvedValue({})
        const mockUploadColors = vi.fn().mockResolvedValue({})
        const mockUploadBusinessInfo = vi.fn().mockResolvedValue(false)
        const mockUploadPages = vi.fn().mockResolvedValue({})

        const settings: Settings = {
            saveImages: true,
            saveMethod: 'dudaUpload',
            uploadLocation: '12321',
            backupImagesSave: true,
            basePath: 'http://example.com',
            url: 'http://example.com/image.jpg',
            siteType: 'priority',
        }

        const result = await save(settings, mockScrapedData, {
            imageUploadFunction: mockImageUpload,
            siteDataUploadFunction: mockS3Upload,
            seoUploadFunction: mockSeoUpload,
            saveColorsToDudaFunction: mockUploadColors,
            saveBusinessInfoToDudaFunction: mockUploadBusinessInfo,
            savePagesToDudaFunction: mockUploadPages,
        })

        expect(result.dataUploadDetails?.s3UploadedImages).toBeDefined()
        expect(result.dataUploadDetails?.uploadedResources).toEqual(mockDudaResponse.uploaded_resources)
        expect(mockImageUpload).toHaveBeenCalledTimes(2)
        expect(mockS3Upload).toHaveBeenCalled()
        expect(mockUploadColors).toHaveBeenCalled()
        expect(mockSeoUpload).toHaveBeenCalled()
        expect(mockUploadBusinessInfo).toHaveBeenCalled()
    })

    it('should handle Duda upload with imageList instead of imageFiles', async () => {
        const mockImageList = [
            { src: 'https://s3.example.com/image.jpg', pageTitle: 'Home' },
            { src: 'https://s3.example.com/image2.jpg', pageTitle: 'Home' },
        ]

        const mockSiteData: ScrapedAndAnalyzedSiteData = {
            pages: [],
            baseUrl: 'http://example.com/image.jpg',
            dudaUploadLocation: '',
            assetData: {
                s3UploadedImages: [
                    { src: 'https://s3.example.com/image.jpg', pageTitle: 'Home' },
                    { src: 'https://s3.example.com/image2.jpg', pageTitle: 'Home' },
                ],
                s3LogoUrl: '',
            },
        }

        const mockScrapedData = {
            imageNames: [],
            url: 'http://example.com',
            imageList: mockImageList,
            siteData: mockSiteData,
        }

        const mockDudaResponse = {
            uploaded_resources: [
                {
                    url: 'https://s3.example.com/image.jpg',
                    id: '12345',
                    original_url: 'http://example.com/image.jpg',
                    new_url: 'https://irt-cdn.multiscreensite.com/image1.png',
                    status: 'UPLOADED',
                },
                {
                    url: 'https://s3.example.com/image2.jpg',
                    id: '12345',
                    original_url: 'http://example.com/image.jpg',
                    new_url: 'https://irt-cdn.multiscreensite.com/image1.png',
                    status: 'UPLOADED',
                },
            ],
        }

        const mockImageUpload = vi.fn().mockResolvedValue(mockDudaResponse)
        const mockSiteDataUpload = vi.fn().mockReturnValue('https://s3.example.com/site-data.json')
        const mockSeoUpload = vi.fn().mockResolvedValue({})
        const mockUploadColors = vi.fn().mockResolvedValue({})
        const mockUploadBusinessInfo = vi.fn().mockResolvedValue(false)
        const settings: Settings = {
            saveImages: true,
            saveMethod: 'dudaUpload',
            backupImagesSave: false,
            uploadLocation: '12321',
            basePath: 'http://example.com',
            url: 'http://example.com/image.jpg',
            siteType: 'priority',
        }

        const result = await save(settings, mockScrapedData, {
            imageUploadFunction: mockImageUpload,
            siteDataUploadFunction: mockSiteDataUpload,
            saveBusinessInfoToDudaFunction: mockUploadBusinessInfo,
            seoUploadFunction: mockSeoUpload,
            saveColorsToDudaFunction: mockUploadColors,
        })

        expect(result).toHaveProperty('dataUploadDetails')
        expect(mockImageUpload).toHaveBeenCalled()
        expect(result.dataUploadDetails?.imageUploadTotal).toBe(2)
        expect(result.dataUploadDetails?.failedImageCount).toBe(0)
        expect(result.dataUploadDetails?.uploadedResources).toHaveLength(2)
        expect(result.dataUploadDetails?.failedImages).toHaveLength(0)
        expect(result.dataUploadDetails?.s3UploadedImages).toHaveLength(0)
        expect(result.url).toBe('http://example.com')
        expect(result.siteData).toStrictEqual(mockSiteData)
    })
})
