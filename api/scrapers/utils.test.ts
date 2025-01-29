import { describe, it, expect, vi } from 'vitest'
import { extractFormData, preprocessImageUrl, updateImageObjWithLogo } from './utils.js'

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
})

describe('updateImageWithLogo', () => {
    it('should add the logo tpe to the correct image', () => {
        const imageFileExample = {
            imageFileName: 'test',
            fileContents: 'any',
            url: 'image.com',
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
        const imageFileExample = {
            imageFileName: 'test',
            fileContents: 'any',
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
        const imageFileExample = {
            imageFileName: 'test',
            fileContents: 'any',
            url: 'image.com',
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
