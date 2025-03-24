import { it, describe, expect, vi } from 'vitest'
import { extractJsonFromRes } from './api.js'

describe('extractJsonFromRes', () => {
    it('should extract correct JSON from an example AI response', async () => {
        const responseContent = `
        Here's the analysis based on the provided HTML and screenshot:
        
        \`\`\`json
        {
          "logoTag": "<img src=\\"https://static.wixstatic.com/media/3a7531_18aad6c061b74caea4beff1d77ab4460~mv2.png/v1/fill/w_241,h_86,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Toy-Mania-Logo-600.png\\" alt=\\"Toy-Mania-Logo-600.png\\" width=\\"241\\" height=\\"86\\">",
          "companyName": "Toy Mania Charlotte",
          "address": "242 S Sharon Amity Road, Charlotte, NC 28211",
          "phoneNumber": "(704) 910-2001",
          "hours": "Mon - Thurs, 9 am to 7 pm; Fri - Sat, 9 am to 7 pm; Sunday, 12 am to 6 pm",
          "styles": {
            "colors": {
              "primaryColor": "#FF4040",
              "secondaryColor": "#0033A0",
              "tertiaryColor": "#FFFFFF",
              "quaternary": "#FFC107",
              "textColor": "#000000",
              "mainContentBackgroundColor": "#F8F9FA"
            },
            "fonts": {
              "headerFonts": ["Playfair Display", "Arial"],
              "bodyFonts": ["Open Sans", "Arial", "Helvetica, sans-serif"]
            }
          },
          "links": {
            "socials": [
              "http://www.facebook.com/toymaniacharlotte",
              "https://instagram.com/toymaniausa/"
            ],
            "other": [
              "https://www.toymaniausa.com",
              "https://www.toymaniausa.com/mailing-list",
              "https://www.toymaniausa.com/virtual-tour",
              "https://www.toymaniausa.com/jobs",
              "https://www.toymaniausa.com/press"
            ]
          }
        }
        \`\`\`
        `

        const parsedJson = extractJsonFromRes(responseContent)

        expect(parsedJson.companyName).toBe('Toy Mania Charlotte')
    })
    it('should throw an error when json is not found in the response', async () => {
        const responseContent = `generic non json response `
        let error
        try {
            const parsedJson = extractJsonFromRes(responseContent)
        } catch (err) {
            error = err
        }

        expect(error.message).toContain('Error extracting JSON')
    })

    it('should strip comments that are inside the JSON and handle correctly', async () => {
        const contentWithComments = `{
        "logoTag": "<img src=\\"/files/2023/11/water-drop-white.png\\">",
        "companyName": "Aqua Pool & Spa",
        "address": "Hannibal, OH 43931",
        "phoneNumber": "(740) 312-7321",
        "hours": "Mo, Tu, We, Th, Fr, Sa, Su 07:00-19:00",
        "styles": {
          "colors": {
            "primaryColor": "#00BFFF", // Assumed based on screenshot
            "secondaryColor": "#FFFFFF", // White for text/backgrounds
            "tertiaryColor": "#333333", // Dark gray for text
            "quaternary": "#eeeeee", // Light gray
            "textColor": "#000000", // Black for main text
            "mainContentBackgroundColor": "#f7f7f7" // Background color from content sections
          },
          "fonts": {
            "headerFonts": ["Roboto", "IBM Plex Sans"],
            "bodyFonts": ["Roboto", "IBM Plex Sans"]
          }
        },
        "links": {
          "socials": [],
          "other": [
            "https://maps.google.com/maps?daddr=, Hannibal, OH 43931",
            "https://www.google.com/gtag/js?id=G-PF8RFHR03F",
            "https://www.googletagmanager.com/gtag/js?id=G-TDG4C70DL9"
          ]
        }
      }`

        const parsedJson = extractJsonFromRes(contentWithComments)

        expect(parsedJson.address).toBe('Hannibal, OH 43931')
    })
})
