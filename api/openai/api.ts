import OpenAI from 'openai'
import { Page } from 'playwright'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '12', // This is the default and can be omitted
})

export async function analyzeHeaderForLogo(headerHtml: string) {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are a web scraper analyzing HTML to identify a website logo.',
                },
                {
                    role: 'user',
                    content: `Here is the HTML of the <header> tag: ${headerHtml}. Identify the logo from this HTML and then give me the <img> tag with the src value.`,
                },
            ],
        })
        const result = response.choices[0]?.message?.content?.trim()
        console.log('chatgpt res', result)
        const srcMatch = result?.match(/<img\s[^>]*src="([^"]+)"/) //match the image tag src value
        const logoSrc = srcMatch ? srcMatch[1] : null

        return logoSrc || null
    } catch (error) {
        console.error('Error with OpenAI API:', error)
        return 'Error identifying logo.'
    }
}

/* function base64EncodeImageFromBuffer(buffer: any) {
    // Convert the buffer to a Uint8Array
    const uint8Array = new Uint8Array(buffer)

    // Convert the Uint8Array to a string
    const string = String.fromCharCode.apply(null, uint8Array)

    // Encode the string in base64
    const base64 = btoa(string)

    return base64
}
 */
/* async function sendImgToGPT(image: any) {
    try {
        console.log('attempting to send image')
        const base64Image = image.toString('base64')
        const base64ImageUrl = `data:image/jpeg;base64,${base64Image}`

        //image test
        const responseImage = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: 'Can you send me the hex colors form this image?' },
                        { type: 'image_url', image_url: { url: base64ImageUrl } },
                    ],
                },
            ],
        })

        console.log('openai image test', responseImage.choices[0])
    } catch (error) {
        console.error('Error with OpenAI API images:', error)
        return 'Error identifying logo.'
    }
} */

export async function captureScreenshotAndAnalyze(page: Page) {
    // Step 1: Take a screenshot
    // const screenshotPath = path.resolve('screenshot.png')
    const buffer = await page.screenshot({ fullPage: true })
    // await page.screenshot({ path: screenshotPath })
    //const screenshotBuffer = fs.readFileSync(screenshotPath)

    // Step 2: Extract primary colors
    // const colors = await getColors(screenshotBuffer, 'image/png');
    //const primaryHexColors = colors.map(color => color.hex());

    //console.log('Primary Hex Colors:', primaryHexColors);

    // Step 3: Send screenshot to OpenAI for company name and address analysis
    // const base64Image = screenshotBuffer.toString('base64')
    const base64Image = buffer.toString('base64')
    const base64ImageUrl = `data:image/jpeg;base64,${base64Image}`
    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: 'Analyze the following screenshot and provide the company name and address if visible. Can you also provide the top 3 brand colors with their hex values?',
                    },
                    { type: 'image_url', image_url: { url: base64ImageUrl } },
                ],
            },
        ],
    })

    console.log('openai screenshot tests', response.choices[0])

    //const analysis = response.choices[0]?.message?.content || '';
    //console.log('Analysis Result:', analysis);

    // Step 4: Clean up
    // fs.unlinkSync(screenshotPath)

    /* return {
        // primaryHexColors,
        analysis,
    } */
}
