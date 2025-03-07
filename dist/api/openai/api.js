import OpenAI from 'openai';
import { ScrapingError } from '../../src/utilities/errors.js';
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '12',
});
export async function analyzePageData(url, screenshotBuffer, pageHtml) {
    try {
        const base64Image = screenshotBuffer.toString('base64');
        const base64ImageUrl = `data:image/jpeg;base64,${base64Image}`;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vYXBpL29wZW5haS9hcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxNQUFNLE1BQU0sUUFBUSxDQUFBO0FBQzNCLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQTtBQUU3RCxNQUFNLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQztJQUN0QixNQUFNLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLElBQUksSUFBSTtDQUM3QyxDQUFDLENBQUE7QUFFRixNQUFNLENBQUMsS0FBSyxVQUFVLGVBQWUsQ0FBQyxHQUFXLEVBQUUsZ0JBQXdCLEVBQUUsUUFBZ0I7SUFDekYsSUFBSSxDQUFDO1FBQ0QsTUFBTSxXQUFXLEdBQUcsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQ3ZELE1BQU0sY0FBYyxHQUFHLDBCQUEwQixXQUFXLEVBQUUsQ0FBQTtRQUU5RCxNQUFNLFFBQVEsR0FBRyxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQztZQUNsRCxLQUFLLEVBQUUsYUFBYTtZQUNwQixRQUFRLEVBQUU7Z0JBQ047b0JBQ0ksSUFBSSxFQUFFLE1BQU07b0JBQ1osT0FBTyxFQUFFO3dCQUNMOzRCQUNJLElBQUksRUFBRSxNQUFNOzRCQUNaLElBQUksRUFBRTs7O3FFQUdtQyxRQUFROzs7Ozs7d1JBTTJNLEdBQUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3FDQWdDdFA7eUJBQ1o7d0JBRUQsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxFQUFFLEdBQUcsRUFBRSxjQUFjLEVBQUUsRUFBRTtxQkFDNUQ7aUJBQ0o7YUFDSjtTQUNKLENBQUMsQ0FBQTtRQUVGLElBQUksVUFBVSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxFQUFFLE9BQU8sSUFBSSxFQUFFLENBQUE7UUFDNUQsT0FBTyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsRUFBRSxVQUFVLENBQUMsQ0FBQTtRQUNwRCxNQUFNLFVBQVUsR0FBRyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsQ0FBQTtRQUNqRCxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxVQUFVLENBQUMsQ0FBQTtRQUV0QyxPQUFPLFVBQVUsQ0FBQTtJQUNyQixDQUFDO0lBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNYLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDbEIsTUFBTSxJQUFJLGFBQWEsQ0FBQztZQUNwQixPQUFPLEVBQUUsOENBQThDLEdBQUcsR0FBRyxDQUFDLE9BQU87WUFDckUsS0FBSyxFQUFFLEVBQUUsWUFBWSxFQUFFLHdCQUF3QixFQUFFO1lBQ2pELFNBQVMsRUFBRSxTQUFTO1lBQ3BCLE1BQU0sRUFBRSxFQUFFO1NBQ2IsQ0FBQyxDQUFBO0lBQ04sQ0FBQztBQUNMLENBQUM7QUFFRCxNQUFNLENBQUMsTUFBTSxrQkFBa0IsR0FBRyxDQUFDLFFBQWdCLEVBQUUsRUFBRTtJQUNuRCxJQUFJLENBQUM7UUFDRCx1REFBdUQ7UUFDdkQsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUE7UUFDMUYsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ2IsTUFBTSxJQUFJLEtBQUssQ0FBQyxtREFBbUQsQ0FBQyxDQUFBO1FBQ3hFLENBQUM7UUFFRCxJQUFJLFVBQVUsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUE7UUFFcEMsb0RBQW9EO1FBQ3BELFVBQVUsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLDhDQUE4QyxFQUFFLENBQUMsS0FBSyxFQUFFLGFBQWEsRUFBRSxFQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtRQUV2SSxvQkFBb0I7UUFDcEIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFBO0lBQ2pDLENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2IsT0FBTyxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUE7UUFDdEQsTUFBTSxFQUFFLEdBQUcsS0FBSyxFQUFFLE9BQU8sRUFBRSx5QkFBeUIsR0FBRyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDMUUsQ0FBQztBQUNMLENBQUMsQ0FBQSJ9