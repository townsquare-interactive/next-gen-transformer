import { it, describe, expect, vi, beforeEach, afterEach } from 'vitest'
import { ScrapingError } from '../../src/utilities/errors.js'
import { scrapeAssetsFromSite } from '../../src/controllers/scrape-controller.js'

describe('Scrape Images For Duda', () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    it('should return the correct number of image files on a single page scrape', async () => {
        const url = 'https://scrapeurl.com'
        const mockScrapeFunction = vi.fn().mockResolvedValue({
            // Succeed on the second attempt
            imageList: ['image1.jpg', 'image2.jpg'],
            imageFiles: [
                { imageFileName: 'image1.jpg', fileContents: 'image1content' },
                { imageFileName: 'image2.jpg', fileContents: 'image2content' },
                { imageFileName: 'image3.jpg', fileContents: 'image3content' },
            ],
        })

        const mockFindPagesFunction = vi.fn().mockResolvedValue(['page1'])

        const result = await scrapeAssetsFromSite({
            url,
            saveMethod: 'test',
            retries: 2,
            functions: { scrapeFunction: mockScrapeFunction, scrapePagesFunction: mockFindPagesFunction }, // Pass the mock function
            basePath: 'scrapeurl',
        })

        expect(mockScrapeFunction).toHaveBeenCalledTimes(1)
        expect(result.imageFiles.length).toBe(3)
    })

    it('should run multiples scrapes with multiple pages', async () => {
        const url = 'https://scrapeurl.com'
        const mockScrapeFunction = vi
            .fn()
            .mockResolvedValueOnce({
                // First page images
                imageList: ['image1.jpg', 'image2.jpg'],
                imageFiles: [
                    { imageFileName: 'image1.jpg', fileContents: 'image1content' },
                    { imageFileName: 'image2.jpg', fileContents: 'image2content' },
                    { imageFileName: 'image3.jpg', fileContents: 'image3content' },
                ],
            })
            .mockResolvedValueOnce({
                // Second page images
                imageList: ['image1.jpg', 'image2.jpg'],
                imageFiles: [
                    { imageFileName: 'image4.jpg', fileContents: 'image4content' },
                    { imageFileName: 'image5.jpg', fileContents: 'image5content' },
                ],
            })

        const mockFindPagesFunction = vi.fn().mockResolvedValue(['page1', 'page2'])

        const result = await scrapeAssetsFromSite({
            url,
            saveMethod: 'test',
            retries: 2,
            functions: { scrapeFunction: mockScrapeFunction, scrapePagesFunction: mockFindPagesFunction }, // Pass the mock function
            basePath: 'scrapeurl',
        })

        // Verify that the mock scrape function was called twice
        expect(mockScrapeFunction).toHaveBeenCalledTimes(2)
        expect(result.imageFiles.length).toBe(5)
    })

    it('should retry the scrape function if it fails initially and succeed on subsequent attempts', async () => {
        const url = 'https://scrapeurl.com'
        const mockScrapeFunction = vi
            .fn()
            .mockRejectedValueOnce(new Error('Temporary scraping error')) // Fail on the first attempt
            .mockResolvedValueOnce({
                // Succeed on the second attempt
                imageList: ['image1.jpg', 'image2.jpg'],
                imageFiles: [
                    { imageFileName: 'image1.jpg', fileContents: 'image1content' },
                    { imageFileName: 'image2.jpg', fileContents: 'image2content' },
                ],
            })

        const mockFindPagesFunction = vi.fn().mockResolvedValue(['page1'])

        const result = await scrapeAssetsFromSite({
            url,
            saveMethod: 'test',
            retries: 2,
            functions: { scrapeFunction: mockScrapeFunction, scrapePagesFunction: mockFindPagesFunction }, // Pass the mock function
            basePath: 'scrapeurl',
        })

        // Verify that the mock scrape function was called twice
        expect(mockScrapeFunction).toHaveBeenCalledTimes(2)
        expect(result.imageFiles.length).toBe(2)
    })

    it('should fail after retrying the specified number of times', async () => {
        const url = 'https://scrapeurl.com'
        const mockScrapeFunction = vi.fn().mockRejectedValue(new Error('Permanent scraping error')) // Always fail

        const mockFindPagesFunction = vi.fn().mockResolvedValue(['page1'])

        let error: any
        try {
            await scrapeAssetsFromSite({
                url,
                saveMethod: 'test',
                retries: 3,
                functions: { scrapeFunction: mockScrapeFunction, scrapePagesFunction: mockFindPagesFunction },
                basePath: 'scrapeurl',
            })
        } catch (err) {
            error = err
        }

        expect(mockScrapeFunction).toHaveBeenCalledTimes(3)
        expect(error).toBeInstanceOf(ScrapingError)
        expect(error).toMatchObject({
            domain: url,
            message: 'Permanent scraping error',
            state: { scrapeStatus: 'URL not able to be scraped' },
            errorType: 'SCR-011',
        })
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('should fail when the URL is not a valid site', async () => {
        const errUrl = 'https://www.notereal.com'
        let error: any

        const mockFindPagesFunction = vi.fn().mockResolvedValue(['page1', 'page2'])

        try {
            await scrapeAssetsFromSite({
                url: errUrl,
                timeoutLength: 10000,
                retries: 1,
                functions: { scrapePagesFunction: mockFindPagesFunction },
                basePath: 'scrapeurl',
            })
        } catch (err) {
            error = err
        }

        expect(error).toBeInstanceOf(ScrapingError)
        expect(error.message).toContain(`Error loading URL: page1`)
    }, 15000)
})
