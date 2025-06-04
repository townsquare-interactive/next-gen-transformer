import { it, describe, expect, vi, beforeEach, afterEach } from 'vitest'
import { getScrapedDataFromS3, getScrapedInfoDocFromS3, scrapeAssetsFromSite } from './scrape-service.js'
import { ScrapingError } from '../utilities/errors.js'

describe('scrapeAssetsFromSite', () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    it('should return the correct number of image files on a single page scrape', async () => {
        const url = 'https://scrapeurl.com'
        const mockValidateURl = vi.fn().mockResolvedValue(true)
        const mockScrapeFunction = vi.fn().mockResolvedValue({
            imageList: ['image1.jpg', 'image2.jpg'],
            imageFiles: [
                { imageFileName: 'image1.jpg', fileContents: 'image1content', url: { origin: 'scrapeurl.com', pathname: 'image1content' } },
                { imageFileName: 'image2.jpg', fileContents: 'image2content', url: { origin: 'image2content', pathname: 'image1content' } },
                { imageFileName: 'image3.jpg', fileContents: 'image3content', url: { origin: 'image3content', pathname: 'image1content' } },
                { imageFileName: 'image4.mp4', fileContents: 'image4content', url: { origin: 'image4content', pathname: 'image1content' }, type: 'video' },
            ],
        })

        const mockFindPagesFunction = vi.fn().mockResolvedValue(['https://scrapeurl.com/page1'])

        const result = await scrapeAssetsFromSite({
            url,
            saveMethod: 'test',
            functions: { scrapeFunction: mockScrapeFunction, scrapePagesFunction: mockFindPagesFunction, isValidateUrl: mockValidateURl },
            basePath: 'scrapeurl',
        })

        expect(mockScrapeFunction).toHaveBeenCalledTimes(1)
        expect(result.imageFiles.length).toBe(4)
    })

    it('should run multiples scrapes with multiple pages', async () => {
        const url = 'https://scrapeurl.com'
        const mockValidateURl = vi.fn().mockResolvedValue(true)
        const mockScrapeFunction = vi
            .fn()
            .mockResolvedValueOnce({
                // First page images
                imageList: ['image1.jpg', 'image2.jpg'],
                imageFiles: [
                    {
                        imageFileName: 'image1.jpg',
                        fileContents: 'turn the correct number of image files on a single page scrapeimage1content',
                        url: { origin: 'scrapeurl.com', pathname: 'image1content' },
                    },
                    { imageFileName: 'image2.jpg', fileContents: 'image2content', url: { origin: 'image2content', pathname: 'image1content' } },
                    { imageFileName: 'image3.jpg', fileContents: 'image3content', url: { origin: 'image3content', pathname: 'image1content' } },
                ],
            })
            .mockResolvedValueOnce({
                // Second page images
                imageList: ['image1.jpg', 'image2.jpg'],
                imageFiles: [
                    { imageFileName: 'image4.jpg', fileContents: 'image1content', url: { origin: 'scrapeurl.com', pathname: 'image4content' } },
                    { imageFileName: 'image5.jpg', fileContents: 'image2content', url: { origin: 'image2content', pathname: 'image5content' } },
                ],
            })

        const mockFindPagesFunction = vi.fn().mockResolvedValue(['https://scrapeurl.com/page1', 'https://scrapeurl.com/page2'])

        const result = await scrapeAssetsFromSite({
            url,
            saveMethod: 'test',
            functions: { scrapeFunction: mockScrapeFunction, scrapePagesFunction: mockFindPagesFunction, isValidateUrl: mockValidateURl }, // Pass the mock function
            basePath: 'scrapeurl',
        })

        // Verify that the mock scrape function was called twice
        expect(mockScrapeFunction).toHaveBeenCalledTimes(2)
        expect(result.imageFiles.length).toBe(5)
    })

    it('should fail when pages found are not on the same domain', async () => {
        const url = 'https://scrapeurl.com'
        const mockScrapeFunction = vi
            .fn()
            .mockResolvedValueOnce({
                // First page images
                imageList: ['image1.jpg', 'image2.jpg'],
                imageFiles: [
                    { imageFileName: 'image1.jpg', fileContents: 'image1content', url: { origin: 'scrapeurl.com', pathname: 'image1content' } },
                    { imageFileName: 'image2.jpg', fileContents: 'image2content', url: { origin: 'image2content', pathname: 'image1content' } },
                    { imageFileName: 'image3.jpg', fileContents: 'image3content', url: { origin: 'image3content', pathname: 'image1content' } },
                ],
            })
            .mockResolvedValueOnce({
                // Second page images
                imageList: ['image1.jpg', 'image2.jpg'],
                imageFiles: [
                    { imageFileName: 'image4.jpg', fileContents: 'image1content', url: { origin: 'scrapeurl.com', pathname: 'image4content' } },
                    { imageFileName: 'image5.jpg', fileContents: 'image2content', url: { origin: 'image2content', pathname: 'image5content' } },
                ],
            })

        const pages = ['https://scrapeurl.com/page1', 'https://otherurl.com/page2']

        const mockFindPagesFunction = vi.fn().mockResolvedValue(pages)
        const mockValidateURl = vi.fn().mockResolvedValue(true)

        let error
        try {
            const result = await scrapeAssetsFromSite(
                {
                    url,
                    saveMethod: 'test',
                    functions: { scrapeFunction: mockScrapeFunction, scrapePagesFunction: mockFindPagesFunction, isValidateUrl: mockValidateURl }, // Pass the mock function
                    basePath: 'scrapeurl',
                },
                undefined,
                1
            )
        } catch (err) {
            error = err
        }

        expect(error).toMatchObject({
            domain: url,
            message: expect.stringContaining('Found pages to scrape are not all on the same domain'),
            state: { scrapeStatus: 'Site not scraped' },
            errorType: 'SCR-016',
        })
    })

    it('should fail after retrying the specified number of times', async () => {
        const url = 'https://scrapeurl.com'
        const mockScrapeFunction = vi.fn().mockRejectedValue(new Error('Permanent scraping error')) // Always fail

        const mockFindPagesFunction = vi.fn().mockResolvedValue(['https://scrapeurl.com/page1'])

        const mockValidateURl = vi.fn().mockResolvedValue(true)

        let error: any
        try {
            await scrapeAssetsFromSite(
                {
                    url,
                    saveMethod: 'test',
                    functions: { scrapeFunction: mockScrapeFunction, scrapePagesFunction: mockFindPagesFunction, isValidateUrl: mockValidateURl },
                    basePath: 'scrapeurl',
                },
                undefined,
                1
            )
        } catch (err) {
            error = err
        }

        expect(mockScrapeFunction).toHaveBeenCalledTimes(1)
        expect(error).toBeInstanceOf(ScrapingError)
        expect(error).toMatchObject({
            domain: url,
            message: 'Permanent scraping error',
            state: { scrapeStatus: 'Site not scraped' }, // Match the actual value
            errorType: 'GEN-003',
        })
    }, 15000)

    it('should fail when the URL is not a valid site', async () => {
        const errUrl = 'https://www.notereal.com'
        let error

        const mockFindPagesFunction = vi.fn().mockResolvedValue(['https://notereal.com/page1', 'https://notereal.com/page2'])

        try {
            await scrapeAssetsFromSite({
                url: errUrl,
                timeoutLength: 10000,
                functions: { scrapePagesFunction: mockFindPagesFunction },
                basePath: 'scrapeurl',
            })
        } catch (err) {
            console.log('Error thrown:', err)
            error = err
        }

        expect(error).toBeInstanceOf(ScrapingError)
        expect(error).toMatchObject({
            domain: errUrl,
            message: expect.stringContaining('Invalid or non-HTML page: https://www.notereal.com'),
            state: { scrapeStatus: 'Site not scraped' },
            errorType: 'SCR-011',
        })
    }, 15000)

    it('should retry and succeed after initial failure', async () => {
        const testUrl = 'https://www.example.com'
        let attemptCount = 0

        const mockValidateURl = vi.fn().mockResolvedValue(true)
        const mockScrapeFunction = vi.fn().mockResolvedValue({
            imageList: ['image1.jpg', 'image2.jpg'],
            imageFiles: [
                { imageFileName: 'image1.jpg', fileContents: 'image1content', url: { origin: 'scrapeurl.com', pathname: 'image1content' } },
                { imageFileName: 'image2.jpg', fileContents: 'image2content', url: { origin: 'image2content', pathname: 'image1content' } },
                { imageFileName: 'image3.jpg', fileContents: 'image3content', url: { origin: 'image3content', pathname: 'image1content' } },
            ],
        })

        // Mock function that fails first time, succeeds second time
        const mockFindPagesFunction = vi.fn().mockImplementation(() => {
            attemptCount++
            if (attemptCount === 1) {
                throw new Error('First attempt failed')
            }
            return Promise.resolve(['https://www.example.com/page1'])
        })

        const result = await scrapeAssetsFromSite({
            url: testUrl,
            timeoutLength: 10000,
            functions: { scrapePagesFunction: mockFindPagesFunction, isValidateUrl: mockValidateURl, scrapeFunction: mockScrapeFunction },
            basePath: 'example',
        })

        // Verify the function was called multiple times
        expect(mockFindPagesFunction).toHaveBeenCalledTimes(2)

        // Verify we got a successful result
        expect(result).toBeDefined()
        expect(result.url).toBe(testUrl)

        // Verify the mock functions were called as expected
        expect(mockValidateURl).toHaveBeenCalled()
        expect(mockScrapeFunction).toHaveBeenCalled()
    }, 15000)

    afterEach(() => {
        vi.restoreAllMocks()
    })
})

describe('getScrapedDataFromS3', () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    it('get and return scraped data from s3', async () => {
        const url = 'https://scrapeurl.com'
        const mockScrapeFunction = vi.fn().mockResolvedValue({
            imageList: ['image1.jpg', 'image2.jpg'],
            imageFiles: [{ imageFileName: 'image1.jpg', fileContents: 'image1content', url: { origin: 'scrapeurl.com', pathname: 'image1content' } }],
        })

        const result = await getScrapedDataFromS3(url, mockScrapeFunction)

        expect(result).toEqual({
            imageList: ['image1.jpg', 'image2.jpg'],
            imageFiles: [{ imageFileName: 'image1.jpg', fileContents: 'image1content', url: { origin: 'scrapeurl.com', pathname: 'image1content' } }],
        })
    })

    it('throw error if no data found in s3', async () => {
        const url = 'https://scrapeurl.com'
        const mockScrapeFunction = vi.fn().mockResolvedValue(null)

        try {
            const result = await getScrapedDataFromS3(url, mockScrapeFunction)
        } catch (err) {
            expect(err).toBeInstanceOf(ScrapingError)
            expect(err).toMatchObject({
                domain: url,
                message: 'Scraped data not found in S3',
                errorType: 'AMS-006',
            })
        }
    })
    it('throw error if error data found in s3 file', async () => {
        const url = 'https://scrapeurl.com'
        const mockScrapeFunction = vi.fn().mockResolvedValue({
            error: {
                id: 'a90f3a58-880b-4ab8-8769-c2d818fcaa46',
                message: 'Scraped data not found in S3',
                error: {
                    errorType: 'AMS-010',
                    state: {
                        req: {
                            url: 'https://nextgenprototype.production.townsquareinteractive.com',
                        },
                    },
                },
                stack: 'Error Stack',
                date: '2025-06-03',
            },
        })

        try {
            const result = await getScrapedDataFromS3(url, mockScrapeFunction)
        } catch (err) {
            expect(err).toBeInstanceOf(ScrapingError)
            expect(err).toMatchObject({
                domain: '',
                message: 'Error during scraping: Scraped data not found in S3',
                errorType: 'AMS-010',
                state: {
                    id: 'a90f3a58-880b-4ab8-8769-c2d818fcaa46',
                    req: {
                        url: 'https://nextgenprototype.production.townsquareinteractive.com',
                    },
                    stack: 'Error Stack',
                    date: '2025-06-03',
                },
            })
        }
    })
})

describe('getScrapedInfoDocFromS3', () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    it('get and return scraped info doc from s3', async () => {
        const url = 'https://scrapeurl.com'
        const mockGetScrapedInfoDocFromS3 = vi.fn().mockResolvedValue('scraped info doc')

        const result = await getScrapedInfoDocFromS3(url, mockGetScrapedInfoDocFromS3)
        expect(result).toEqual('scraped info doc')
    })

    it('throw error if no data found in s3', async () => {
        const url = 'https://scrapeurl.com'
        const mockGetScrapedInfoDocFromS3 = vi.fn().mockResolvedValue(null)
        try {
            const result = await getScrapedInfoDocFromS3(url, mockGetScrapedInfoDocFromS3)
        } catch (err) {
            expect(err).toBeInstanceOf(ScrapingError)
            expect(err).toMatchObject({
                domain: url,
                message: 'Scraped info doc not found in S3',
                errorType: 'AMS-006',
                state: { scrapeStatus: 'Asset doc never uploaded' },
            })
        }
    })
})
