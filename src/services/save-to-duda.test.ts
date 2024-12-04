import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { save } from './save-to-duda.js'
import { ScrapingError } from '../utilities/errors.js'

describe('save function', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.restoreAllMocks()
    })

    afterEach(() => {
        mockSaveFunction.mockReset()
    })

    const mockResponse = {
        uploaded_resources: [
            { url: 'https://example.com/image1.png', id: '12345' },
            { url: 'https://example.com/image2.png', id: '67890' },
        ],
    }

    const mockSaveFunction: any = vi.fn(async () => mockResponse)

    it('should call the fetch correctly', async () => {
        const settings = { url: 'scrapedsite.com' } // Mocked settings object
        const imageFiles2: any = [
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
                hashedFileName: 'hashedname.jpg',
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
                hashedFileName: 'hashedname.jpg',
                fileContents: {},
            },
        ]

        console.log('Starting test...')
        const result = await save(settings, imageFiles2, mockSaveFunction)
        console.log('Result:', result)

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
        const settings = { url: 'scrapedsite.com' } // Mocked settings object
        const imageFiles2: any = [
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
                hashedFileName: 'hashedname.jpg',
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
                hashedFileName: 'hashedname.jpg',
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
                hashedFileName: 'hashedname.jpg',
                fileContents: {},
            },
        ]

        console.log('Starting test...')
        const result = await save(settings, imageFiles2, mockSaveFunction)
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
        const settings = { url: 'scrapedsite.com' } // Mocked settings object
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
                hashedFileName: 'hashedname.jpg',
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
                hashedFileName: 'hashedname.jpg',
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
                hashedFileName: 'hashedname.jpg',
                fileContents: {},
            },
        ]

        let error
        try {
            const result = await save(settings, imageFilesErr, mockSaveFunction)
        } catch (err) {
            error = err
        }

        expect(mockSaveFunction).toHaveBeenCalledTimes(1)
        expect(error).toBeInstanceOf(ScrapingError)
        expect(error.message).toEqual(`Failed to upload batch images: ${errMessage}`)
    })
})
