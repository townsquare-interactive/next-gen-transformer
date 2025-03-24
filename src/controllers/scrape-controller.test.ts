import { it, describe, expect, vi, beforeEach, afterEach } from 'vitest'
import { getScrapedDataFromS3, scrapeAssetsFromSite } from './scrape-controller.js'
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
        expect(result.imageFiles.length).toBe(3)
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
            const result = await scrapeAssetsFromSite({
                url,
                saveMethod: 'test',
                functions: { scrapeFunction: mockScrapeFunction, scrapePagesFunction: mockFindPagesFunction, isValidateUrl: mockValidateURl }, // Pass the mock function
                basePath: 'scrapeurl',
            })
        } catch (err) {
            error = err
        }

        console.log('check error', error)

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
            await scrapeAssetsFromSite({
                url,
                saveMethod: 'test',
                functions: { scrapeFunction: mockScrapeFunction, scrapePagesFunction: mockFindPagesFunction, isValidateUrl: mockValidateURl },
                basePath: 'scrapeurl',
            })
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
    })

    it('should fail when the URL is not a valid site', async () => {
        const errUrl = 'https://www.notereal.com'
        let error: any

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

        /*        expect(error.domain).toEqual(errUrl)
        expect(error.state).toEqual({ scrapeStatus: 'Site not scraped' })
        expect(error.message).toEqual('ScrapingError: Invalid or non-HTML page: https://www.notereal.com')
        expect(error.errorType).toEqual('SCR-011') */

        expect(error).toMatchObject({
            domain: errUrl,
            message: expect.stringContaining('Invalid or non-HTML page: https://www.notereal.com'),
            state: { scrapeStatus: 'Site not scraped' },
            errorType: 'SCR-011',
        })
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
})
