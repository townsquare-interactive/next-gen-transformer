import OpenAI from 'openai';
import { ScrapingError } from '../../src/utilities/errors.js';
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '12',
});
export async function capturePageAndAnalyze(page, url) {
    try {
        const buffer = await page.screenshot({ fullPage: true });
        const base64Image = buffer.toString('base64');
        const base64ImageUrl = `data:image/jpeg;base64,${base64Image}`;
        const pageHtml = await page.content(); // Get the full HTML content of the page
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

                        Task 2: Here is the full HTML of the page: ${pageHtml}. Using this HTML and the screenshot provided, identify the colors used on the page and provide appropriate values for the JSON below in the colors object. Provide these colors in their hex values or as close approximations.

                        Task 3: Analyze the fonts used for headers and body text in the HTML. Provide the font-family names or a description if the font cannot be identified precisely.

                        Task 4: Identify the logo from the header section of the HTML (if available) and provide the <img> tag with the src value.

                        Task 5: Identify the extrnal links in the sites code. Seperate them from social media links and other links. Remove duplicates of social media links if they seem to be going to the same pages. Do not include any links that link within the same domain of ${url}.

                        Respond in the following JSON format:
                        
                        {
                          "logoTag": "string or null",
                          "companyName": "string or null",
                          "address": "string or null",
                          "phoneNumber": "string or null",
                          "hours": "string or null",
                          "styles": {
                            "colors": {
                              "primaryColor": "hex or null",
                              "secondaryColor": "hex or null",
                              "tertiaryColor": "hex or null",
                              "quaternary":"hex or null",
                              "textColor":"hex or null",
                              "mainContentBackgroundColor":"hex or null",

                            },
                            "fonts": {
                              "headerFonts": ["array of fonts or null"],
                              "bodyFonts": ["array of fonts or null"]
                            }
                          },
                          "links":{
                            "socials":"[array of links or null],
                            "other":[array of links or null]
                        }
                        }
                        
                        If any information is not available, return it as null.
                                    `,
                        },
                        { type: 'image_url', image_url: { url: base64ImageUrl } },
                    ],
                },
            ],
        });
        let rawContent = response.choices[0]?.message?.content || '';
        console.log('openai anlysis raw result', rawContent);
        const parsedJson = extractJsonFromRes(rawContent);
        console.log('parsed json', parsedJson);
        return parsedJson;
    }
    catch (err) {
        console.error(err);
        throw new ScrapingError({
            message: `Failed to analyze scraped data with openai: ` + err.message,
            state: { scrapeStatus: 'Scraped data not saved' },
            errorType: 'SCR-013',
            domain: '',
        });
    }
}
export const extractJsonFromRes = (response) => {
    try {
        // Use regex to extract the JSON block from the content
        const jsonMatch = response.match(/```json([\s\S]*?)```/i) || response.match(/({[\s\S]*})/);
        if (!jsonMatch) {
            throw new Error('Error extracting JSON: No JSON found in response.');
        }
        let jsonString = jsonMatch[1].trim();
        // Remove comments (only outside of string literals)
        jsonString = jsonString.replace(/("(?:\\.|[^"\\])*")|\/\/.*|\/\*[\s\S]*?\*\//g, (match, stringLiteral) => (stringLiteral ? match : ''));
        // Parse JSON string
        return JSON.parse(jsonString);
    }
    catch (error) {
        console.error('Error extracting JSON:', error.message);
        throw { ...error, message: 'Error extracting JSON: ' + error.message };
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vYXBpL29wZW5haS9hcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxNQUFNLE1BQU0sUUFBUSxDQUFBO0FBRTNCLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQTtBQUU3RCxNQUFNLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQztJQUN0QixNQUFNLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLElBQUksSUFBSTtDQUM3QyxDQUFDLENBQUE7QUFFRixNQUFNLENBQUMsS0FBSyxVQUFVLHFCQUFxQixDQUFDLElBQVUsRUFBRSxHQUFXO0lBQy9ELElBQUksQ0FBQztRQUNELE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFBO1FBQ3hELE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDN0MsTUFBTSxjQUFjLEdBQUcsMEJBQTBCLFdBQVcsRUFBRSxDQUFBO1FBRTlELE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFBLENBQUMsd0NBQXdDO1FBRTlFLE1BQU0sUUFBUSxHQUFHLE1BQU0sTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDO1lBQ2xELEtBQUssRUFBRSxhQUFhO1lBQ3BCLFFBQVEsRUFBRTtnQkFDTjtvQkFDSSxJQUFJLEVBQUUsTUFBTTtvQkFDWixPQUFPLEVBQUU7d0JBQ0w7NEJBQ0ksSUFBSSxFQUFFLE1BQU07NEJBQ1osSUFBSSxFQUFFOzs7cUVBR21DLFFBQVE7Ozs7Ozt3UkFNMk0sR0FBRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7cUNBZ0N0UDt5QkFDWjt3QkFFRCxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLEVBQUUsR0FBRyxFQUFFLGNBQWMsRUFBRSxFQUFFO3FCQUM1RDtpQkFDSjthQUNKO1NBQ0osQ0FBQyxDQUFBO1FBRUYsSUFBSSxVQUFVLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsT0FBTyxJQUFJLEVBQUUsQ0FBQTtRQUM1RCxPQUFPLENBQUMsR0FBRyxDQUFDLDJCQUEyQixFQUFFLFVBQVUsQ0FBQyxDQUFBO1FBQ3BELE1BQU0sVUFBVSxHQUFHLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxDQUFBO1FBQ2pELE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLFVBQVUsQ0FBQyxDQUFBO1FBRXRDLE9BQU8sVUFBVSxDQUFBO0lBQ3JCLENBQUM7SUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ1gsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNsQixNQUFNLElBQUksYUFBYSxDQUFDO1lBQ3BCLE9BQU8sRUFBRSw4Q0FBOEMsR0FBRyxHQUFHLENBQUMsT0FBTztZQUNyRSxLQUFLLEVBQUUsRUFBRSxZQUFZLEVBQUUsd0JBQXdCLEVBQUU7WUFDakQsU0FBUyxFQUFFLFNBQVM7WUFDcEIsTUFBTSxFQUFFLEVBQUU7U0FDYixDQUFDLENBQUE7SUFDTixDQUFDO0FBQ0wsQ0FBQztBQUVELE1BQU0sQ0FBQyxNQUFNLGtCQUFrQixHQUFHLENBQUMsUUFBZ0IsRUFBRSxFQUFFO0lBQ25ELElBQUksQ0FBQztRQUNELHVEQUF1RDtRQUN2RCxNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQTtRQUMxRixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDYixNQUFNLElBQUksS0FBSyxDQUFDLG1EQUFtRCxDQUFDLENBQUE7UUFDeEUsQ0FBQztRQUVELElBQUksVUFBVSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtRQUVwQyxvREFBb0Q7UUFDcEQsVUFBVSxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsOENBQThDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsYUFBYSxFQUFFLEVBQUUsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO1FBRXZJLG9CQUFvQjtRQUNwQixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUE7SUFDakMsQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDYixPQUFPLENBQUMsS0FBSyxDQUFDLHdCQUF3QixFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUN0RCxNQUFNLEVBQUUsR0FBRyxLQUFLLEVBQUUsT0FBTyxFQUFFLHlCQUF5QixHQUFHLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUMxRSxDQUFDO0FBQ0wsQ0FBQyxDQUFBIn0=