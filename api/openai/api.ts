import OpenAI from 'openai'
import { Page } from 'playwright'
import { ScrapingError } from '../../src/utilities/errors.js'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '12',
})

export async function capturePageAndAnalyze(page: Page) {
    try {
        const buffer = await page.screenshot({ fullPage: true })
        const base64Image = buffer.toString('base64')
        const base64ImageUrl = `data:image/jpeg;base64,${base64Image}`

        const headerHtml = await page.evaluate(() => {
            const header = document.querySelector('header')
            return header ? header.outerHTML : ''
        })

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
        })

        console.log('openai screenshot tests', response.choices[0])

        let rawContent = response.choices[0]?.message?.content || ''
        rawContent = rawContent?.replace(/```json|```/g, '').trim()
        const parsedJson = JSON.parse(rawContent)
        console.log('parsed json', parsedJson)

        return parsedJson
    } catch (err) {
        throw new ScrapingError({
            message: `Failed to analyze scraped data with openai: ` + err.message,
            state: { scrapeStatus: 'Scraped images not saved' },
            errorType: 'SCR-013',
            domain: '',
        })
    }
}
