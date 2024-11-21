import { it, describe, expect, test } from 'vitest'
import { scrapeImagesFromSite } from './image-scrape.js'
import { ScrapingError } from '../../src/utilities/errors.js'

describe('Scrrape Images For Duda', () => {
    const url = 'https://www.townsquareignite.com/landing/tacobell/home'
    it('should return an array with the scraped image strings with a valid url', async () => {
        const result = await scrapeImagesFromSite({ url: url, storagePath: 's3' })
        expect(result.scrapedImages.length).toBeGreaterThan(0)
    }, 25000)

    /* it('should fail when the URL is not a valid site', async () => {
        const errUrl = 'https://www.notereal.com'
        let error: any

        try {
            await scrapeImagesFromSite({ url: errUrl, storagePath: 's3' })
        } catch (err) {
            error = err // Capture the error
        }

        // Assert the error is an instance of ScrapingError
        expect(error).toBeInstanceOf(ScrapingError)

        // Assert specific properties of the error
        expect(error).toMatchObject({
            domain: errUrl,
            message: expect.stringContaining(`Failed to scrape images for site: ${errUrl}`),
            state: { scrapeStatus: 'URL not able to be scraped' },
            errorType: 'SCR-011',
        })
    }, 25000) */
})
