import { describe, it, expect, vi } from 'vitest'
import { checkPagesAreOnSameDomain, cleanseHtml, extractFormData, extractPageContent, preprocessImageUrl, updateImageObjWithLogo } from './utils.js'
import { ScrapingError } from '../../src/utilities/errors.js'

/**
 * @vitest-environment jsdom
 */

describe('preprocessImageUrl', () => {
    it('should preprocess URLs correctly', () => {
        const imageFiles: any = [
            {
                url: {
                    href: 'https://www.townsquareignite.com/_next/image?url=https%3A%2F%2Ftownsquareignite.s3.us-east-1.amazonaws.com%2Flanding-pages%2Fclients%2Ftacobell.com%2Fimages%2Fselected%2FpurpleButtonLogo.jpg&w=1920&q=80',
                    origin: 'https://www.townsquareignite.com',
                    protocol: 'https:',
                    username: '',
                    password: '',
                    host: 'www.townsquareignite.com',
                    hostname: 'www.townsquareignite.com',
                    port: '',
                    pathname: '/_next/image',
                    search: '?url=https%3A%2F%2Ftownsquareignite.s3.us-east-1.amazonaws.com%2Flanding-pages%2Fclients%2Ftacobell.com%2Fimages%2Fselected%2FpurpleButtonLogo.jpg&w=1920&q=80',
                    searchParams: new URLSearchParams({
                        url: 'https://townsquareignite.s3.us-east-1.amazonaws.com/landing-pages/clients/tacobell.com/images/selected/purpleButtonLogo.jpg',
                        w: '1920',
                        q: '80',
                    }),
                    hash: '',
                },
                imageFileName: 'hashedname.jpg',
                fileContents: {},
            },
            {
                url: {
                    href: 'https://www.townsquareignite.com/_next/image?url=https%3A%2F%2Ftownsquareignite.s3.us-east-1.amazonaws.com%2Flanding-pages%2Fclients%2Ftacobell.com%2Fimages%2Fselected%2FTacobell.comLogo.png&w=1920&q=80',
                    origin: 'https://www.townsquareignite.com',
                    protocol: 'https:',
                    username: '',
                    password: '',
                    host: 'www.townsquareignite.com',
                    hostname: 'www.townsquareignite.com',
                    port: '',
                    pathname: '/_next/image',
                    search: '?url=https%3A%2F%2Ftownsquareignite.s3.us-east-1.amazonaws.com%2Flanding-pages%2Fclients%2Ftacobell.com%2Fimages%2Fselected%2FTacobell.comLogo.png&w=1920&q=80',
                    searchParams: new URLSearchParams({
                        url: 'https://townsquareignite.s3.us-east-1.amazonaws.com/landing-pages/clients/tacobell.com/images/selected/Tacobell.comLogo.png',
                        w: '1920',
                        q: '80',
                    }),
                    hash: '',
                },
                imageFileName: 'hashedname.jpg',
                fileContents: {},
            },
        ]

        // Check preprocessImageUrl
        expect(preprocessImageUrl(imageFiles[0].url)).toBe(
            'https://townsquareignite.s3.us-east-1.amazonaws.com/landing-pages/clients/tacobell.com/images/selected/purpleButtonLogo.jpg'
        )
        expect(preprocessImageUrl(imageFiles[1].url)).toBe(
            'https://townsquareignite.s3.us-east-1.amazonaws.com/landing-pages/clients/tacobell.com/images/selected/Tacobell.comLogo.png'
        ) // Duplicate detected
    })

    it('should return null if the URL field is blank', () => {
        const imageFiles: any = [
            {
                url: '',
            },
        ]

        // Check preprocessImageUrl
        expect(preprocessImageUrl(imageFiles[0].url)).toBe(null)
    })
})

describe('updateImageWithLogo', () => {
    it('should add the logo tpe to the correct image', () => {
        const imageFileExample: any = {
            imageFileName: 'test',
            fileContents: null,
            url: null,
            hashedFileName: 'test',
            originalImageLink:
                'https://static.wixstatic.com/media/3a7531_18aad6c061b74caea4beff1d77ab4460~mv2.png/v1/fill/w_241,h_86,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Toy-Mania-Logo-600.png',
            fileExtension: 'png',
        }

        const imageFileEx2 = { ...imageFileExample, originalImageLink: 'test' }
        const imageFiles = [imageFileExample, imageFileEx2]

        const logoAnalysis =
            '<img src="https://static.wixstatic.com/media/3a7531_18aad6c061b74caea4beff1d77ab4460~mv2.png/v1/fill/w_241,h_86,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Toy-Mania-Logo-600.png" alt="Toy-Mania-Logo-600.png" style="width:241px;height:86px;object-fit:cover" width="241" height="86">'

        const updatedFiles = updateImageObjWithLogo(logoAnalysis, imageFiles)
        expect(updatedFiles).toStrictEqual([{ ...imageFileExample, type: 'logo' }, imageFileEx2])
    })

    it('should not change the imageFiles if no logo found', () => {
        const imageFileExample: any = {
            imageFileName: 'test',
            fileContents: null,
            url: 'image.com',
            hashedFileName: 'test',
            originalImageLink:
                'https://static.wixstatic.com/media/3a7531_18aad6c061b74caea4beff1d77ab4460~mv2.png/v1/fill/w_241,h_86,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Toy-Mania-Logo-600.png',
            fileExtension: 'png',
        }
        const imageFiles = [imageFileExample]

        const noLogoFound = 'No Logo Found'

        const updatedFiles = updateImageObjWithLogo(noLogoFound, imageFiles)
        expect(updatedFiles).toStrictEqual(imageFiles)
    })

    it('should not change the imageFiles if the logo src does not match', () => {
        const imageFileExample: any = {
            imageFileName: 'test',
            fileContents: null,
            url: null,
            hashedFileName: 'test',
            originalImageLink:
                'https://static.wixstatic.com/media/3a7531_18aad6c061b74caea4beff1d77ab4460~mv2.png/v1/fill/w_241,h_86,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Toy-Mania-Logo-600.png',
            fileExtension: 'png',
        }
        const imageFiles = [imageFileExample]

        const altSrcFind = '<img src="randomsrcvalue" style="width:241px;height:86px;object-fit:cover" width="241" height="86">'

        const updatedFiles = updateImageObjWithLogo(altSrcFind, imageFiles)
        expect(updatedFiles).toStrictEqual(imageFiles)
    })
})

describe('extractFormData', () => {
    it('extracts form data from the HTML', async () => {
        const mockFormsHTML = `
      <form>
        <legend>Contact Us</legend>
        <label for="name">Name</label>
        <input type="text" id="name" name="name" placeholder="Enter your name" required>
        <label for="email">Email</label>
        <input type="email" id="email" name="email" placeholder="Enter your email">
        <button type="submit">Submit</button>
      </form>
    `

        document.body.innerHTML = mockFormsHTML

        const page = {
            evaluate: vi.fn().mockImplementation(async (fn: () => any) => {
                return fn()
            }),
        }

        const formData = await extractFormData(page as any)

        expect(formData).toEqual([
            {
                title: 'Contact Us',
                fields: [
                    {
                        name: 'name',
                        type: 'text',
                        label: 'Name',
                        placeholder: 'Enter your name',
                        required: true,
                    },
                    {
                        name: 'email',
                        type: 'email',
                        label: 'Email',
                        placeholder: 'Enter your email',
                        required: false,
                    },
                ],
            },
        ])

        expect(page.evaluate).toHaveBeenCalledOnce()
    })

    it('extracts empty array from a mocked page', async () => {
        const mockFormsHTML = `
      <html>
<label>test</label>
      </html>
    `

        document.body.innerHTML = mockFormsHTML

        const page = {
            evaluate: vi.fn().mockImplementation(async (fn: () => any) => {
                return fn()
            }),
        }

        const formData = await extractFormData(page as any)

        expect(formData).toEqual([])

        expect(page.evaluate).toHaveBeenCalledOnce()
    })
})

describe('extractPageContent', () => {
    it('extracts content excluding unwanted tags', async () => {
        const mockContentHTML = `
            <body><nav>Navigation Menu</nav>
            <header>
                <h1>Main Title</h1>
                <p>Some header text</p>
            </header>
            <article>
                <h2>Subtitle</h2>
                <p>Article content here.</p>
            </article>
            <footer>Footer Text</footer>
            <script>console.log('script tag')</script></body>
        `

        const page = {
            evaluate: vi.fn().mockImplementation(async (fn: () => any) => {
                document.body.innerHTML = mockContentHTML
                console.log('Simulated body HTML:', document.body.innerHTML)

                return fn()
            }),
        }

        const content = await extractPageContent(page as any)

        // Expected content: Header and visible text from <article>
        expect(content).toContain(`Subtitle`)
        expect(content).toContain(`Article content here.`)
    })

    it('returns empty string if the body has no content', async () => {
        document.body.innerHTML = ``

        const page = {
            evaluate: vi.fn().mockImplementation(async (fn: () => any) => {
                return fn()
            }),
        }

        const content = await extractPageContent(page as any)

        expect(page.evaluate).toHaveBeenCalledOnce()
        expect(content).toEqual('')
    })

    it('removes all unwanted tags and retains only visible text', async () => {
        const mockContentHTML = `
            <style>body { color: red; }</style>
            <script>console.log('hidden')</script>
            <article>
                <p>Visible paragraph text.</p>
            </article>
        `

        const page = {
            evaluate: vi.fn().mockImplementation(async (fn: () => any) => {
                document.body.innerHTML = mockContentHTML
                return fn()
            }),
        }

        const content = await extractPageContent(page as any)

        expect(page.evaluate).toHaveBeenCalledOnce()
        expect(content).toEqual(`Visible paragraph text.`)
    })

    it('handles whitespace correctly in extracted content', async () => {
        const mockContentHTML = `
            <div>
                <h1>   Main Title   </h1>
                <p>    Paragraph with spaces    </p>
            </div>
        `

        document.body.innerHTML = mockContentHTML

        const page = {
            evaluate: vi.fn().mockImplementation(async (fn: () => any) => {
                return fn()
            }),
        }

        const content = await extractPageContent(page as any)

        // expect(page.evaluate).toHaveBeenCalledOnce()
        expect(content).toContain(`Main Title`)
        expect(content).toContain(`Paragraph with spaces`)
    })
})

describe('cleanseHtml', () => {
    it('should remove script, meta, noscript, link, and svg elements from the page', async () => {
        document.body.innerHTML = `
            <div>
                <p>Keep this text</p>
                <script>console.log("Remove this script")</script>
                <meta charset="UTF-8">
                <noscript>This should be removed</noscript>
                <link rel="stylesheet" href="styles.css">
                <svg><circle cx="50" cy="50" r="40" /></svg>
            </div>
        `

        const page = {
            evaluate: vi.fn().mockImplementation(async (fn) => fn()),
        }

        const cleanedHtml = await cleanseHtml(page as any)
        expect(cleanedHtml).toContain('<p>Keep this text</p>')
        expect(cleanedHtml).not.toContain('<script>')
        expect(cleanedHtml).not.toContain('<meta')
        expect(cleanedHtml).not.toContain('<noscript>')
        expect(cleanedHtml).not.toContain('<link')
        expect(cleanedHtml).not.toContain('<svg')
    })

    it('should truncate HTML if it exceeds 100000 characters', async () => {
        const longHtml = '<div>' + 'a'.repeat(100050) + '</div>'
        document.body.innerHTML = longHtml

        const page = {
            evaluate: vi.fn().mockImplementation(async (fn) => fn()),
        }

        const cleanedHtml = await cleanseHtml(page as any)
        expect(cleanedHtml.length).toBe(100000)
    })
})

describe('checkPagesAreOnSameDomain', () => {
    it('should confirm pages on the same domain returns true', async () => {
        const pages = ['https://www.donerighttv.com/', 'https://www.donerighttv.com/live-streaming']

        const result = checkPagesAreOnSameDomain('https://www.donerighttv.com/', pages)

        expect(result).toEqual(true)
    })

    it('should fail when pages are not on the same domain', async () => {
        const url = 'https://www.donerighttv.com/'
        const invalidPages = ['https://www.donerighttv.com/', 'https://www.othersite.com/live-streaming']
        let error

        try {
            checkPagesAreOnSameDomain('https://www.donerighttv.com/', invalidPages)
        } catch (err) {
            error = err
        }

        expect(error).toBeInstanceOf(ScrapingError)
        expect(error).toMatchObject({
            domain: url,
            message: expect.stringContaining('Found pages to scrape are not all on the same domain'),
            state: { scrapeStatus: 'Site not scraped', pages: invalidPages },
            errorType: 'SCR-016',
        })
    })
})
