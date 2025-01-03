import OpenAI from 'openai';
import { ScrapingError } from '../../src/utilities/errors.js';
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '12',
});
export async function capturePageAndAnalyze(page) {
    try {
        const buffer = await page.screenshot({ fullPage: true });
        const base64Image = buffer.toString('base64');
        const base64ImageUrl = `data:image/jpeg;base64,${base64Image}`;
        const headerHtml = await page.evaluate(() => {
            const header = document.querySelector('header');
            return header ? header.outerHTML : '';
        });
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: `
                        Task 1: Please analyze the provided screenshot and extract the information in the JSON object below. 

                        Task 2: Here is the HTML of the <header> tag: ${headerHtml}. Identify the logo from this HTML and then give me the <img> tag with the src value.

                        Respond in the following JSON format:
                        
                        {
                          "logoTag": "string or null",
                          "companyName": "string or null",
                          "address": "string or null",
                          "phoneNumber": "string or null",
                          "hours": "string or null",
                        }
                        
                        If any information is not available, return it as null.
                                    `,
                        },
                        { type: 'image_url', image_url: { url: base64ImageUrl } },
                    ],
                },
            ],
        });
        console.log('openai screenshot tests', response.choices[0]);
        let rawContent = response.choices[0]?.message?.content || '';
        rawContent = rawContent?.replace(/```json|```/g, '').trim();
        const parsedJson = JSON.parse(rawContent);
        console.log('parsed json', parsedJson);
        return parsedJson;
    }
    catch (err) {
        throw new ScrapingError({
            message: `Failed to analyze scraped data with openai: ` + err.message,
            state: { scrapeStatus: 'Scraped images not saved' },
            errorType: 'SCR-013',
            domain: '',
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vYXBpL29wZW5haS9hcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxNQUFNLE1BQU0sUUFBUSxDQUFBO0FBRTNCLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQTtBQUU3RCxNQUFNLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQztJQUN0QixNQUFNLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLElBQUksSUFBSTtDQUM3QyxDQUFDLENBQUE7QUFFRixNQUFNLENBQUMsS0FBSyxVQUFVLHFCQUFxQixDQUFDLElBQVU7SUFDbEQsSUFBSSxDQUFDO1FBQ0QsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUE7UUFDeEQsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUM3QyxNQUFNLGNBQWMsR0FBRywwQkFBMEIsV0FBVyxFQUFFLENBQUE7UUFFOUQsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRTtZQUN4QyxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFBO1lBQy9DLE9BQU8sTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUE7UUFDekMsQ0FBQyxDQUFDLENBQUE7UUFFRixNQUFNLFFBQVEsR0FBRyxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQztZQUNsRCxLQUFLLEVBQUUsYUFBYTtZQUNwQixRQUFRLEVBQUU7Z0JBQ047b0JBQ0ksSUFBSSxFQUFFLE1BQU07b0JBQ1osT0FBTyxFQUFFO3dCQUNMOzRCQUNJLElBQUksRUFBRSxNQUFNOzRCQUNaLElBQUksRUFBRTs7O3dFQUdzQyxVQUFVOzs7Ozs7Ozs7Ozs7O3FDQWE3Qzt5QkFDWjt3QkFFRCxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLEVBQUUsR0FBRyxFQUFFLGNBQWMsRUFBRSxFQUFFO3FCQUM1RDtpQkFDSjthQUNKO1NBQ0osQ0FBQyxDQUFBO1FBRUYsT0FBTyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsRUFBRSxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFFM0QsSUFBSSxVQUFVLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsT0FBTyxJQUFJLEVBQUUsQ0FBQTtRQUM1RCxVQUFVLEdBQUcsVUFBVSxFQUFFLE9BQU8sQ0FBQyxjQUFjLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUE7UUFDM0QsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQTtRQUN6QyxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxVQUFVLENBQUMsQ0FBQTtRQUV0QyxPQUFPLFVBQVUsQ0FBQTtJQUNyQixDQUFDO0lBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNYLE1BQU0sSUFBSSxhQUFhLENBQUM7WUFDcEIsT0FBTyxFQUFFLDhDQUE4QyxHQUFHLEdBQUcsQ0FBQyxPQUFPO1lBQ3JFLEtBQUssRUFBRSxFQUFFLFlBQVksRUFBRSwwQkFBMEIsRUFBRTtZQUNuRCxTQUFTLEVBQUUsU0FBUztZQUNwQixNQUFNLEVBQUUsRUFBRTtTQUNiLENBQUMsQ0FBQTtJQUNOLENBQUM7QUFDTCxDQUFDIn0=