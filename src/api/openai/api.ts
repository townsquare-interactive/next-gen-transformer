import OpenAI from 'openai'
import { ScrapingError } from '../../utilities/errors.js'
import type { ScreenshotData } from '../../schema/output-zod.js'
import { ChatCompletionContentPart } from 'openai/resources/index.js'

export async function analyzePageData(url: string, screenshotBuffer: Buffer, pageHtml: string, notHomePage = false) {
    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY || '12',
        })

        const base64Image = screenshotBuffer.toString('base64')
        const base64ImageUrl = `data:image/jpeg;base64,${base64Image}`

        let contentPrompt: ChatCompletionContentPart[] = [
            {
                type: 'text',
                text: `
            Task 1: Please analyze the provided screenshot and extract the information in the JSON object below. 

            Task 2: Here is the full HTML of the page: ${pageHtml}. Using this HTML and the screenshot provided, identify the colors used on the page and provide appropriate values for the JSON below in the colors object. Provide these colors in their hex values or as close approximations.

            Task 3: Analyze the fonts used for headers and body text in the HTML. Provide the font-family names or a description if the font cannot be identified precisely.

            Task 4: Identify the logo from the header section of the HTML (if available) and provide the <img> tag with the src value.

            Task 5: Identify the extrnal links in the sites code. Seperate them from social media links and other links. Remove duplicates of social media links if they seem to be going to the same pages. Do not include any links that link within the same domain of ${url}. Do not alter the individual links in any way.

            Task 6: Identify the business type of the site. Please choose an option from schema.org business types or null if it does not fit any of the options.

            Respond in the following JSON format:
            
            {
              "logoTag": "string or null",
              "companyName": "string or null",
              "address": {
                "streetAddress": "string or null",
                "city": "string or null",
                "state": "string or null",
                "postalCode": "string or null",
              },
              "phoneNumber": "string or null",
              "email": "string or null",
              "hours":{
              "regularHours":{"MON": "string or null", "TUE": "string or null", "WED": "string or null","THU": "string or null","FRI": "string or null", "SAT": "string or null", "SUN": "string or null"},
              "is24Hours":boolean or false,
              },
              "businessType":"string or null"
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
        ]

        if (notHomePage) {
            contentPrompt = [
                {
                    type: 'text',
                    text: `
                Task 1: Please analyze the provided screenshot and the page HTML and extract the information in the JSON object below. 
                page html: ${pageHtml}

    
                Respond in the following JSON format:
                
                {
                  "address": {
                    "streetAddress": "string or null",
                    "city": "string or null",
                    "state": "string or null",
                    "postalCode": "string or null",
                  },
                  "phoneNumber": "string or null",
                  "email": "string or null",
                  "hours":{
                  "regularHours":{"MON": "string or null", "TUE": "string or null", "WED": "string or null","THU": "string or null","FRI": "string or null", "SAT": "string or null", "SUN": "string or null"},
                  "is24Hours":boolean or false,
                  },
                }
                
                If any information is not available, return it as null.
                            `,
                },
                { type: 'image_url', image_url: { url: base64ImageUrl } },
            ]
        }

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'user',
                    content: contentPrompt,
                },
            ],
        })

        const rawContent = response.choices[0]?.message?.content || ''
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

type RecursivePartial<T> = {
    [P in keyof T]?: RecursivePartial<T[P]> | null
}

const replaceNullStrings = <T>(obj: RecursivePartial<T> | null | undefined): RecursivePartial<T> | null => {
    // Special case for explicit null or undefined
    if (obj === null || obj === undefined || obj === 'null') {
        return null
    }

    // Don't convert booleans to null
    if (typeof obj === 'boolean') {
        return obj
    }

    // Handle other primitives
    if (typeof obj !== 'object') {
        return obj
    }

    if (Array.isArray(obj)) {
        return obj.map((item) => (item === 'null' ? null : item))
    }

    const newObj: RecursivePartial<T> = {}
    for (const key in obj) {
        const value = obj[key]
        newObj[key] = replaceNullStrings(value)
    }
    return newObj
}

export const extractJsonFromRes = (response: string): ScreenshotData => {
    try {
        const jsonMatch = response.match(/```json([\s\S]*?)```/i) || response.match(/({[\s\S]*})/)
        if (!jsonMatch) {
            throw new Error('Error extracting JSON: No JSON found in response.')
        }

        let jsonString = jsonMatch[1].trim()

        // Remove comments (only outside of string literals)
        jsonString = jsonString.replace(/("(?:\\.|[^"\\])*")|\/\/.*|\/\*[\s\S]*?\*\//g, (match, stringLiteral) => (stringLiteral ? match : ''))

        // Parse and clean JSON string
        const parsedJson = JSON.parse(jsonString)
        const cleanedData = replaceNullStrings<ScreenshotData>(parsedJson)
        return cleanedData as ScreenshotData
    } catch (error) {
        console.error('Error extracting JSON:', error.message)
        throw { ...error, message: 'Error extracting JSON: ' + error.message }
    }
}
