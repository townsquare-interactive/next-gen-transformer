import OpenAI from 'openai'
import { ScrapingError } from '../../src/utilities/errors.js'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '12',
})

export async function analyzePageData(url: string, screenshotBuffer: Buffer, pageHtml: string) {
    try {
        const base64Image = screenshotBuffer.toString('base64')
        const base64ImageUrl = `data:image/jpeg;base64,${base64Image}`

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
                          "hours":{"MON": "string or null", "TUE": "string or null", "WED": "string or null","THU": "string or null","FRI": "string or null", "SAT": "string or null", "SUN": "string or null"},
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
        })

        let rawContent = response.choices[0]?.message?.content || ''
        console.log('openai anlysis raw result', rawContent)
        const parsedJson = extractJsonFromRes(rawContent)
        console.log('parsed json', parsedJson)

        return parsedJson
    } catch (err) {
        console.error(err)
        throw new ScrapingError({
            message: `Failed to analyze scraped data with openai: ` + err.message,
            state: { scrapeStatus: 'Scraped data not saved' },
            errorType: 'SCR-013',
            domain: '',
        })
    }
}

export const extractJsonFromRes = (response: string) => {
    try {
        // Use regex to extract the JSON block from the content
        const jsonMatch = response.match(/```json([\s\S]*?)```/i) || response.match(/({[\s\S]*})/)
        if (!jsonMatch) {
            throw new Error('Error extracting JSON: No JSON found in response.')
        }

        let jsonString = jsonMatch[1].trim()

        // Remove comments (only outside of string literals)
        jsonString = jsonString.replace(/("(?:\\.|[^"\\])*")|\/\/.*|\/\*[\s\S]*?\*\//g, (match, stringLiteral) => (stringLiteral ? match : ''))

        // Parse JSON string
        return JSON.parse(jsonString)
    } catch (error) {
        console.error('Error extracting JSON:', error.message)
        throw { ...error, message: 'Error extracting JSON: ' + error.message }
    }
}
