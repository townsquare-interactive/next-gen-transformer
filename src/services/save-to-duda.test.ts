import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { save, saveImages } from './save-to-duda.js'
import { ScrapingError } from '../utilities/errors.js'

describe('saveImages', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.restoreAllMocks()
    })

    afterEach(() => {
        vi.resetAllMocks()
    })

    it('should return the correct image upload details and call the functions correctly', async () => {
        const settings = { url: 'scrapedsite.com', basePath: 'scrapedSite', uploadLocation: '12321' }
        const imageFiles: any = [
            {
                url: {
                    href: 'https://www.townsquareignite.com/_next/image?url=https%3A%2F%2Ftownsquareignite.s3.us-east-1.amazonaws.com%2Flanding-pages%2Fclients%2Ftacobell.com%2Fimages%2Fselected%2FpurpleButtonLogo.jpg&w=1920&q=80',
                    origin: 'https://www.townsquareignite.com',
                    protocol: 'https:',
                    username: '',
                    password: '',
                    host: 'www.townsquareignite.com',
                    hostname: 'www.townsquareignite.com',
                    port: '',
                    pathname: '/_next/image',
                    search: '?url=https%3A%2F%2Ftownsquareignite.s3.us-east-1.amazonaws.com%2Flanding-pages%2Fclients%2Ftacobell.com%2Fimages%2Fselected%2FpurpleButtonLogo.jpg&w=1920&q=80',
                    searchParams: new URLSearchParams({
                        url: 'https://townsquareignite.s3.us-east-1.amazonaws.com/landing-pages/clients/tacobell.com/images/selected/purpleButtonLogo.jpg',
                        w: '1920',
                        q: '80',
                    }),
                    hash: '',
                },
                imageFileName: 'hashedname.jpg',
                fileContents: {},
            },
            {
                url: {
                    href: 'https://www.townsquareignite.com/_next/image?url=https%3A%2F%2Ftownsquareignite.s3.us-east-1.amazonaws.com%2Flanding-pages%2Fclients%2Ftacobell.com%2Fimages%2Fselected%2FTacobell.comLogo.png&w=1920&q=80',
                    origin: 'https://www.townsquareignite.com',
                    protocol: 'https:',
                    username: '',
                    password: '',
                    host: 'www.townsquareignite.com',
                    hostname: 'www.townsquareignite.com',
                    port: '',
                    pathname: '/_next/image',
                    search: '?url=https%3A%2F%2Ftownsquareignite.s3.us-east-1.amazonaws.com%2Flanding-pages%2Fclients%2Ftacobell.com%2Fimages%2Fselected%2FTacobell.comLogo.png&w=1920&q=80',
                    searchParams: new URLSearchParams({
                        url: 'https://townsquareignite.s3.us-east-1.amazonaws.com/landing-pages/clients/tacobell.com/images/selected/Tacobell.comLogo.png',
                        w: '1920',
                        q: '80',
                    }),
                    hash: '',
                },
                imageFileName: 'hashedname.jpg',
                fileContents: {},
            },
        ]

        const mockResponse = {
            uploaded_resources: [
                {
                    url: 'https://example.com/image1.png',
                    id: '12345',
                    original_url:
                        'https://static.wixstatic.com/media/3a7531_18aad6c061b74caea4beff1d77ab4460~mv2.png/v1/fill/w_60,h_21,al_c,q_85,usm_0.66_1.00_0.01,blur_2,enc_avif,quality_auto/Toy-Mania-Logo-600.png',
                    new_url: 'https://irt-cdn.multiscreensite.com/c914d96aac4548c2985917d2af88827d/dms3rep/multi/Toy-Mania-Logo-600-be90657b.png',
                    status: 'UPLOADED',
                },
                {
                    url: 'https://example.com/image2.png',
                    original_url:
                        'https://static.wixstatic.com/media/3a7531_18aad6c061b74caea4beff1d77ab4460~mv2.png/v1/fill/w_60,h_21,al_c,q_85,usm_0.66_1.00_0.01,blur_2,enc_avif,quality_auto/Toy-Mania-Logo-600.png',
                    new_url: 'https://irt-cdn.multiscreensite.com/c914d96aac4548c2985917d2af88827d/dms3rep/multi/Toy-Mania-Logo-600-be90657b.png',
                    status: 'UPLOADED',
                },
            ],
        }

        const mockSaveFunction: any = vi.fn(async () => mockResponse)

        console.log('Starting test...')
        const result = await saveImages(settings, imageFiles, [], '', mockSaveFunction)
        console.log('Result:', result)

        expect(result.failedImageList?.length).toBe(0)
        expect(result.imageUploadCount).toBe(2)
        expect(result.uploadedImages).toEqual(mockResponse.uploaded_resources)

        // Check fetch calls
        expect(mockSaveFunction).toHaveBeenCalledTimes(1)
        expect(mockSaveFunction).toHaveBeenCalledWith(
            [
                {
                    resource_type: 'IMAGE',
                    src: 'https://townsquareignite.s3.us-east-1.amazonaws.com/landing-pages/clients/tacobell.com/images/selected/purpleButtonLogo.jpg',
                    folder: 'Imported',
                },
                {
                    resource_type: 'IMAGE',
                    src: 'https://townsquareignite.s3.us-east-1.amazonaws.com/landing-pages/clients/tacobell.com/images/selected/Tacobell.comLogo.png',
                    folder: 'Imported',
                },
            ],
            settings
        )
        console.log('real result?', result)
    })

    it('should remove duplicates before uploading images', async () => {
        const settings = { url: 'scrapedsite.com', basePath: 'scrapedSite', uploadLocation: '12321' }
        const imageFiles: any = [
            {
                url: {
                    href: 'https://www.townsquareignite.com/_next/image?url=https%3A%2F%2Ftownsquareignite.s3.us-east-1.amazonaws.com%2Flanding-pages%2Fclients%2Ftacobell.com%2Fimages%2Fselected%2FpurpleButtonLogo.jpg&w=1920&q=80',
                    origin: 'https://www.townsquareignite.com',
                    protocol: 'https:',
                    username: '',
                    password: '',
                    host: 'www.townsquareignite.com',
                    hostname: 'www.townsquareignite.com',
                    port: '',
                    pathname: '/_next/image',
                    search: '?url=https%3A%2F%2Ftownsquareignite.s3.us-east-1.amazonaws.com%2Flanding-pages%2Fclients%2Ftacobell.com%2Fimages%2Fselected%2FpurpleButtonLogo.jpg&w=1920&q=80',
                    searchParams: new URLSearchParams({
                        url: 'https://townsquareignite.s3.us-east-1.amazonaws.com/landing-pages/clients/tacobell.com/images/selected/purpleButtonLogo.jpg',
                        w: '1920',
                        q: '80',
                    }),
                    hash: '',
                },
                imageFileName: 'hashedname.jpg',
                fileContents: {},
            },
            {
                url: {
                    href: 'https://www.townsquareignite.com/_next/image?url=https%3A%2F%2Ftownsquareignite.s3.us-east-1.amazonaws.com%2Flanding-pages%2Fclients%2Ftacobell.com%2Fimages%2Fselected%2FpurpleButtonLogo.jpg&w=1920&q=8',
                    protocol: 'https:',
                    username: '',
                    password: '',
                    host: 'www.townsquareignite.com',
                    hostname: 'www.townsquareignite.com',
                    port: '',
                    pathname: '/_next/image',
                    search: '?url=https%3A%2F%2Ftownsquareignite.s3.us-east-1.amazonaws.com%2Flanding-pages%2Fclients%2Ftacobell.com%2Fimages%2Fselected%2FTacobell.comLogo.png&w=1920&q=80',
                    searchParams: new URLSearchParams({
                        url: 'https://townsquareignite.s3.us-east-1.amazonaws.com/landing-pages/clients/tacobell.com/images/selected/purpleButtonLogo.jpg',
                        w: '1920',
                        q: '80',
                    }),
                    hash: '',
                },
                imageFileName: 'hashedname.jpg',
                fileContents: {},
            },
            {
                url: {
                    href: 'https://www.townsquareignite.com/_next/image?url=https%3A%2F%2Ftownsquareignite.s3.us-east-1.amazonaws.com%2Flanding-pages%2Fclients%2Ftacobell.com%2Fimages%2Fselected%2FTacobell.comLogo.png&w=1920&q=80',
                    origin: 'https://www.townsquareignite.com',
                    protocol: 'https:',
                    username: '',
                    password: '',
                    host: 'www.townsquareignite.com',
                    hostname: 'www.townsquareignite.com',
                    port: '',
                    pathname: '/_next/image',
                    search: '?url=https%3A%2F%2Ftownsquareignite.s3.us-east-1.amazonaws.com%2Flanding-pages%2Fclients%2Ftacobell.com%2Fimages%2Fselected%2FTacobell.comLogo.png&w=1920&q=80',
                    searchParams: new URLSearchParams({
                        url: 'https://townsquareignite.s3.us-east-1.amazonaws.com/landing-pages/clients/tacobell.com/images/selected/Tacobell.comLogo.png',
                        w: '1920',
                        q: '80',
                    }),
                    hash: '',
                },
                imageFileName: 'hashedname.jpg',
                fileContents: {},
            },
        ]
        const mockResponse = {
            uploaded_resources: [
                {
                    url: 'https://example.com/image1.png',
                    id: '12345',
                    original_url:
                        'https://static.wixstatic.com/media/3a7531_18aad6c061b74caea4beff1d77ab4460~mv2.png/v1/fill/w_60,h_21,al_c,q_85,usm_0.66_1.00_0.01,blur_2,enc_avif,quality_auto/Toy-Mania-Logo-600.png',
                    new_url: 'https://irt-cdn.multiscreensite.com/c914d96aac4548c2985917d2af88827d/dms3rep/multi/Toy-Mania-Logo-600-be90657b.png',
                    status: 'UPLOADED',
                },
                {
                    url: 'https://example.com/image2.png',
                    original_url:
                        'https://static.wixstatic.com/media/3a7531_18aad6c061b74caea4beff1d77ab4460~mv2.png/v1/fill/w_60,h_21,al_c,q_85,usm_0.66_1.00_0.01,blur_2,enc_avif,quality_auto/Toy-Mania-Logo-600.png',
                    new_url: 'https://irt-cdn.multiscreensite.com/c914d96aac4548c2985917d2af88827d/dms3rep/multi/Toy-Mania-Logo-600-be90657b.png',
                    status: 'UPLOADED',
                },
            ],
        }

        const mockSaveFunction: any = vi.fn(async () => mockResponse)

        console.log('Starting test...')
        const result = await saveImages(settings, imageFiles, [], '', mockSaveFunction)
        console.log('Result:', result)

        // Check fetch calls
        expect(mockSaveFunction).toHaveBeenCalledTimes(1)

        //save only two images because of duplicate
        expect(mockSaveFunction).toHaveBeenCalledWith(
            [
                {
                    resource_type: 'IMAGE',
                    src: 'https://townsquareignite.s3.us-east-1.amazonaws.com/landing-pages/clients/tacobell.com/images/selected/purpleButtonLogo.jpg',
                    folder: 'Imported',
                },
                {
                    resource_type: 'IMAGE',
                    src: 'https://townsquareignite.s3.us-east-1.amazonaws.com/landing-pages/clients/tacobell.com/images/selected/Tacobell.comLogo.png',
                    folder: 'Imported',
                },
            ],
            settings
        )
    })

    it('should handle fetch errors gracefully', async () => {
        const mockResponse = {
            uploaded_resources: [
                {
                    url: 'https://example.com/image1.png',
                    id: '12345',
                    original_url:
                        'https://static.wixstatic.com/media/3a7531_18aad6c061b74caea4beff1d77ab4460~mv2.png/v1/fill/w_60,h_21,al_c,q_85,usm_0.66_1.00_0.01,blur_2,enc_avif,quality_auto/Toy-Mania-Logo-600.png',
                    new_url: 'https://irt-cdn.multiscreensite.com/c914d96aac4548c2985917d2af88827d/dms3rep/multi/Toy-Mania-Logo-600-be90657b.png',
                    status: 'UPLOADED',
                },
                {
                    url: 'https://example.com/image2.png',
                    original_url:
                        'https://static.wixstatic.com/media/3a7531_18aad6c061b74caea4beff1d77ab4460~mv2.png/v1/fill/w_60,h_21,al_c,q_85,usm_0.66_1.00_0.01,blur_2,enc_avif,quality_auto/Toy-Mania-Logo-600.png',
                    new_url: 'https://irt-cdn.multiscreensite.com/c914d96aac4548c2985917d2af88827d/dms3rep/multi/Toy-Mania-Logo-600-be90657b.png',
                    status: 'UPLOADED',
                },
            ],
        }

        const mockSaveFunction: any = vi.fn(async () => mockResponse)
        const settings = { url: 'scrapedsite.com', basePath: 'scrapedSite', uploadLocation: '12321' }
        const errMessage = 'Network error'
        mockSaveFunction.mockRejectedValueOnce(new Error(errMessage))

        const imageFilesErr: any = [
            {
                url: {
                    href: 'https://www.townsquareignite.com/_next/image?url=https%3A%2F%2Ftownsquareignite.s3.us-east-1.amazonaws.com%2Flanding-pages%2Fclients%2Ftacobell.com%2Fimages%2Fselected%2FpurpleButtonLogo.jpg&w=1920&q=80',
                    origin: 'https://www.townsquareignite.com',
                    protocol: 'https:',
                    username: '',
                    password: '',
                    host: 'www.townsquareignite.com',
                    hostname: 'www.townsquareignite.com',
                    port: '',
                    pathname: '/_next/image',
                    search: '?url=https%3A%2F%2Ftownsquareignite.s3.us-east-1.amazonaws.com%2Flanding-pages%2Fclients%2Ftacobell.com%2Fimages%2Fselected%2FpurpleButtonLogo.jpg&w=1920&q=80',
                    searchParams: new URLSearchParams({
                        url: 'https://townsquareignite.s3.us-east-1.amazonaws.com/landing-pages/clients/tacobell.com/images/selected/purpleButtonLogo.jpg',
                        w: '1920',
                        q: '80',
                    }),
                    hash: '',
                },
                imageFileName: 'hashedname.jpg',
                fileContents: {},
            },
            {
                url: {
                    href: 'https://www.townsquareignite.com/_next/image?url=https%3A%2F%2Ftownsquareignite.s3.us-east-1.amazonaws.com%2Flanding-pages%2Fclients%2Ftacobell.com%2Fimages%2Fselected%2FTacobell.comLogo.png&w=1920&q=80',
                    origin: 'https://www.townsquareignite.com',
                    protocol: 'https:',
                    username: '',
                    password: '',
                    host: 'www.townsquareignite.com',
                    hostname: 'www.townsquareignite.com',
                    port: '',
                    pathname: '/_next/image',
                    search: '?url=https%3A%2F%2Ftownsquareignite.s3.us-east-1.amazonaws.com%2Flanding-pages%2Fclients%2Ftacobell.com%2Fimages%2Fselected%2FTacobell.comLogo.png&w=1920&q=80',
                    searchParams: new URLSearchParams({
                        url: 'https://townsquareignite.s3.us-east-1.amazonaws.com/landing-pages/clients/tacobell.com/images/selected/Tacobell.comLogo.png',
                        w: '1920',
                        q: '80',
                    }),
                    hash: '',
                },
                imageFileName: 'hashedname.jpg',
                fileContents: {},
            },
            {
                url: {
                    href: 'https://www.townsquareignite.com/_next/image?url=https%3A%2F%2Ftownsquareignite.s3.us-east-1.amazonaws.com%2Flanding-pages%2Fclients%2Ftacobell.com%2Fimages%2Fselected%2FTacobell.comLogo.png&w=1920&q=80',
                    origin: 'https://www.townsquareignite.com',
                    protocol: 'https:',
                    username: '',
                    password: '',
                    host: 'www.townsquareignite.com',
                    hostname: 'www.townsquareignite.com',
                    port: '',
                    pathname: '/_next/image',
                    search: '?url=https%3A%2F%2Ftownsquareignite.s3.us-east-1.amazonaws.com%2Flanding-pages%2Fclients%2Ftacobell.com%2Fimages%2Fselected%2FTacobell.comLogo.png&w=1920&q=80',
                    searchParams: new URLSearchParams({
                        url: 'https://townsquareignite.s3.us-east-1.amazonaws.com/landing-pages/clients/tacobell.com/images/selected/Tacobell.comLogo.png',
                        w: '1920',
                        q: '80',
                    }),
                    hash: '',
                },
                imageFileName: 'hashedname.jpg',
                fileContents: {},
            },
        ]

        let error
        try {
            const result = await saveImages(settings, imageFilesErr, [], '', mockSaveFunction)
        } catch (err) {
            error = err
        }

        expect(mockSaveFunction).toHaveBeenCalledTimes(1)
        expect(error).toBeInstanceOf(ScrapingError)
        expect(error.message).toEqual(`Failed to upload batch images: Error: ${errMessage}`)
    })

    //it should handle failed uploads
    it('should return failed upload list correctly', async () => {
        const settings = { url: 'scrapedsite.com', basePath: 'scrapedSite', uploadLocation: '12321' }
        const imageFiles: any = [
            {
                url: {
                    href: 'https://www.townsquareignite.com/_next/image?url=https%3A%2F%2Ftownsquareignite.s3.us-east-1.amazonaws.com%2Flanding-pages%2Fclients%2Ftacobell.com%2Fimages%2Fselected%2FpurpleButtonLogo.jpg&w=1920&q=80',
                    origin: 'https://www.townsquareignite.com',
                    protocol: 'https:',
                    username: '',
                    password: '',
                    host: 'www.townsquareignite.com',
                    hostname: 'www.townsquareignite.com',
                    port: '',
                    pathname: '/_next/image',
                    search: '?url=https%3A%2F%2Ftownsquareignite.s3.us-east-1.amazonaws.com%2Flanding-pages%2Fclients%2Ftacobell.com%2Fimages%2Fselected%2FpurpleButtonLogo.jpg&w=1920&q=80',
                    searchParams: new URLSearchParams({
                        url: 'https://townsquareignite.s3.us-east-1.amazonaws.com/landing-pages/clients/tacobell.com/images/selected/purpleButtonLogo.jpg',
                        w: '1920',
                        q: '80',
                    }),
                    hash: '',
                },
                imageFileName: 'hashedname.jpg',
                fileContents: {},
            },
            {
                url: {
                    href: 'https://www.townsquareignite.com/_next/image?url=https%3A%2F%2Ftownsquareignite.s3.us-east-1.amazonaws.com%2Flanding-pages%2Fclients%2Ftacobell.com%2Fimages%2Fselected%2FTacobell.comLogo.png&w=1920&q=80',
                    origin: 'https://www.townsquareignite.com',
                    protocol: 'https:',
                    username: '',
                    password: '',
                    host: 'www.townsquareignite.com',
                    hostname: 'www.townsquareignite.com',
                    port: '',
                    pathname: '/_next/image',
                    search: '?url=https%3A%2F%2Ftownsquareignite.s3.us-east-1.amazonaws.com%2Flanding-pages%2Fclients%2Ftacobell.com%2Fimages%2Fselected%2FTacobell.comLogo.png&w=1920&q=80',
                    searchParams: new URLSearchParams({
                        url: 'https://townsquareignite.s3.us-east-1.amazonaws.com/landing-pages/clients/tacobell.com/images/selected/Tacobell.comLogo.png',
                        w: '1920',
                        q: '80',
                    }),
                    hash: '',
                },
                imageFileName: 'hashedname.jpg',
                fileContents: {},
            },
        ]

        const mockResponse = {
            uploaded_resources: [
                {
                    url: 'https://example.com/image1.png',
                    id: '12345',
                    original_url:
                        'https://static.wixstatic.com/media/3a7531_18aad6c061b74caea4beff1d77ab4460~mv2.png/v1/fill/w_60,h_21,al_c,q_85,usm_0.66_1.00_0.01,blur_2,enc_avif,quality_auto/Toy-Mania-Logo-600.png',
                    new_url: 'https://irt-cdn.multiscreensite.com/c914d96aac4548c2985917d2af88827d/dms3rep/multi/Toy-Mania-Logo-600-be90657b.png',
                    status: 'UPLOADED',
                },
                {
                    url: 'https://example.com/image2.png',
                    original_url:
                        'https://static.wixstatic.com/media/3a7531_18aad6c061b74caea4beff1d77ab4460~mv2.png/v1/fill/w_60,h_21,al_c,q_85,usm_0.66_1.00_0.01,blur_2,enc_avif,quality_auto/Toy-Mania-Logo-600.png',
                    new_url: 'https://irt-cdn.multiscreensite.com/c914d96aac4548c2985917d2af88827d/dms3rep/multi/Toy-Mania-Logo-600-be90657b.png',
                    status: 'NOT_FOUND',
                },
            ],
        }

        const mockSaveFunction: any = vi.fn(async () => mockResponse)
        const result = await saveImages(settings, imageFiles, [], '', mockSaveFunction)

        expect(result.failedImageList?.length).toBe(1)
        expect(result.failedImageList).toContainEqual(
            'https://static.wixstatic.com/media/3a7531_18aad6c061b74caea4beff1d77ab4460~mv2.png/v1/fill/w_60,h_21,al_c,q_85,usm_0.66_1.00_0.01,blur_2,enc_avif,quality_auto/Toy-Mania-Logo-600.png'
        )
        expect(result.imageUploadCount).toBe(1)
        expect(result.uploadedImages).toEqual(mockResponse.uploaded_resources)
    })
})

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
            const result = await save({ settings, imageFiles: [], imageList: [], siteData: mockSiteData, logoUrl: '', functions })
        } catch (err) {
            error = err
        }

        expect(error).toBeInstanceOf(ScrapingError)
        //expect(error.message).toEqual(`Failed to upload images to Duda, no uploadLocation found`)
        expect(error.errorType).toEqual(`SCR-012`)
    })
})
