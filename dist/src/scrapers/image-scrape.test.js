import { it, describe, expect } from 'vitest';
import { scrapeImagesFromSite } from './image-scrape.js';
import { ScrapingError } from '../utilities/errors.js';
describe('Scrrape Images For Duda', () => {
    const url = 'https://www.townsquareignite.com/landing/tacobell/home';
    it('should return an array with the scraped image strings with a valid url', async () => {
        const result = await scrapeImagesFromSite({ url: url, storagePath: 's3' });
        expect(result.scrapedImages.length).toBeGreaterThan(0);
    }, 25000);
    it('should fail when the URL is not a valid site', async () => {
        const errUrl = 'https://www.notereal.com';
        let error;
        try {
            await scrapeImagesFromSite({ url: errUrl, storagePath: 's3' });
        }
        catch (err) {
            error = err; // Capture the error
        }
        // Assert the error is an instance of ScrapingError
        expect(error).toBeInstanceOf(ScrapingError);
        // Assert specific properties of the error
        expect(error).toMatchObject({
            domain: errUrl,
            message: expect.stringContaining(`Failed to scrape images for site: ${errUrl}`),
            state: { scrapeStatus: 'URL not able to be scraped' },
            errorType: 'SCR-011',
        });
    }, 25000);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2Utc2NyYXBlLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvc2NyYXBlcnMvaW1hZ2Utc2NyYXBlLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFRLE1BQU0sUUFBUSxDQUFBO0FBQ25ELE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLG1CQUFtQixDQUFBO0FBQ3hELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQTtBQUV0RCxRQUFRLENBQUMseUJBQXlCLEVBQUUsR0FBRyxFQUFFO0lBQ3JDLE1BQU0sR0FBRyxHQUFHLHdEQUF3RCxDQUFBO0lBQ3BFLEVBQUUsQ0FBQyx3RUFBd0UsRUFBRSxLQUFLLElBQUksRUFBRTtRQUNwRixNQUFNLE1BQU0sR0FBRyxNQUFNLG9CQUFvQixDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQTtRQUMxRSxNQUFNLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDMUQsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFBO0lBRVQsRUFBRSxDQUFDLDhDQUE4QyxFQUFFLEtBQUssSUFBSSxFQUFFO1FBQzFELE1BQU0sTUFBTSxHQUFHLDBCQUEwQixDQUFBO1FBQ3pDLElBQUksS0FBVSxDQUFBO1FBRWQsSUFBSTtZQUNBLE1BQU0sb0JBQW9CLENBQUMsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFBO1NBQ2pFO1FBQUMsT0FBTyxHQUFHLEVBQUU7WUFDVixLQUFLLEdBQUcsR0FBRyxDQUFBLENBQUMsb0JBQW9CO1NBQ25DO1FBRUQsbURBQW1EO1FBQ25ELE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLENBQUE7UUFFM0MsMENBQTBDO1FBQzFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxhQUFhLENBQUM7WUFDeEIsTUFBTSxFQUFFLE1BQU07WUFDZCxPQUFPLEVBQUUsTUFBTSxDQUFDLGdCQUFnQixDQUFDLHFDQUFxQyxNQUFNLEVBQUUsQ0FBQztZQUMvRSxLQUFLLEVBQUUsRUFBRSxZQUFZLEVBQUUsNEJBQTRCLEVBQUU7WUFDckQsU0FBUyxFQUFFLFNBQVM7U0FDdkIsQ0FBQyxDQUFBO0lBQ04sQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFBO0FBQ2IsQ0FBQyxDQUFDLENBQUEifQ==