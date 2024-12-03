import { it, describe, expect, vi, beforeEach, afterEach } from 'vitest'
import { scrapeImagesFromSite, scrape } from './image-scrape.js'
import { ScrapingError } from '../../src/utilities/errors.js'

describe('Scrape Images For Duda', () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    it('should return an array with the scraped image strings with a valid url', async () => {
        const url = 'https://www.townsquareignite.com/landing/tacobell/home'
        const result = await scrapeImagesFromSite({ url: url, saveMethod: 'test' })
        expect(result.imageNames.length).toBeGreaterThan(0)
        expect(result.imageFiles.length).toBeGreaterThan(0)
    }, 25000)

    it('should retry the scrape function if it fails initially and succeed on subsequent attempts', async () => {
        const url = 'https://scrapeurl.com'
        const mockScrapeFunction = vi
            .fn()
            .mockRejectedValueOnce(new Error('Temporary scraping error')) // Fail on the first attempt
            .mockResolvedValueOnce({
                // Succeed on the second attempt
                imageList: ['image1.jpg', 'image2.jpg'],
                imageFiles: [
                    { hashedFileName: 'image1.jpg', fileContents: 'image1content' },
                    { hashedFileName: 'image2.jpg', fileContents: 'image2content' },
                ],
            })

        const result = await scrapeImagesFromSite({
            url,
            saveMethod: 'test',
            retries: 2,
            scrapeFunction: mockScrapeFunction, // Pass the mock function
        })

        // Verify that the mock scrape function was called twice
        expect(mockScrapeFunction).toHaveBeenCalledTimes(2)
        expect(result.imageNames).toEqual(['image1.jpg', 'image2.jpg'])
        expect(result.imageFiles.length).toBe(2)
    })

    it('should fail after retrying the specified number of times', async () => {
        const url = 'https://scrapeurl.com'
        const mockScrapeFunction = vi.fn().mockRejectedValue(new Error('Permanent scraping error')) // Always fail

        let error: any
        try {
            await scrapeImagesFromSite({
                url,
                saveMethod: 'test',
                retries: 3,
                scrapeFunction: mockScrapeFunction,
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

        try {
            await scrapeImagesFromSite({ url: errUrl, timeoutLength: 10000, retries: 1 })
        } catch (err) {
            error = err
        }

        expect(error).toBeInstanceOf(ScrapingError)

        expect(error).toMatchObject({
            domain: errUrl,
            message: expect.stringContaining(`Error loading URL: ${errUrl}`),
            state: { scrapeStatus: 'URL not able to be scraped' },
            errorType: 'SCR-011',
        })
    }, 15000)
})
