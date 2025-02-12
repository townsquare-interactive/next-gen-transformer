import { it, describe, expect, vi, beforeEach, afterEach } from 'vitest'
import { ScrapingError } from '../utilities/errors.js'
import { scrapeAssetsFromSite } from './scrape-controller.js'

describe('scrapeAssetsFromSite', () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    it('should return the correct number of image files on a single page scrape', async () => {
        const url = 'https://scrapeurl.com'
        const mockScrapeFunction = vi.fn().mockResolvedValue({
            // Succeed on the second attempt
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

        const mockFindPagesFunction = vi.fn().mockResolvedValue(['https://scrapeurl.com/page1', 'https://scrapeurl.com/page2'])

        const result = await scrapeAssetsFromSite({
            url,
            saveMethod: 'test',
            functions: { scrapeFunction: mockScrapeFunction, scrapePagesFunction: mockFindPagesFunction }, // Pass the mock function
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

        let error
        try {
            const result = await scrapeAssetsFromSite({
                url,
                saveMethod: 'test',
                functions: { scrapeFunction: mockScrapeFunction, scrapePagesFunction: mockFindPagesFunction }, // Pass the mock function
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

        let error: any
        try {
            await scrapeAssetsFromSite({
                url,
                saveMethod: 'test',
                functions: { scrapeFunction: mockScrapeFunction, scrapePagesFunction: mockFindPagesFunction },
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
            errorType: 'SCR-011',
        })
    })

    afterEach(() => {
        vi.restoreAllMocks()
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
        console.log('tst error', error)

        expect(error).toMatchObject({
            domain: errUrl,
            message: expect.stringContaining('page.goto: Timeout 10000ms exceeded'),
            state: { scrapeStatus: 'Site not scraped' },
            errorType: 'SCR-011',
        })
    }, 15000)
})
