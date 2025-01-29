import { Page } from 'playwright'
import { createRandomFiveCharString } from '../../src/utilities/utils.js'
import { ImageFiles } from './asset-scrape.js'
import crypto from 'crypto'

export function preprocessImageUrl(itemUrl: any): string | null {
    if (!itemUrl) {
        console.error('URL is null or undefined:', itemUrl)
        throw new Error('Invalid URL: Cannot process')
    }

    let url = itemUrl

    // Extract the actual S3 URL from the `url` query parameter, or fallback to the raw href
    const s3Url = url.searchParams.get('url')
    const finalUrl = s3Url ? decodeURIComponent(s3Url) : url.href

    return finalUrl
}

// Rename duplicate imageFileNames
export const renameDuplicateFiles = (files: any[]): any[] => {
    const nameCount = new Map<string, number>()

    return files.map((item) => {
        let fileName = item.imageFileName

        // If the name already exists, append a suffix
        if (nameCount.has(fileName)) {
            nameCount.set(fileName, nameCount.get(fileName)! + 1)
            const randomSuffix = createRandomFiveCharString()
            fileName = appendSuffixToFileName(fileName, randomSuffix) // Modify the filename before extension
        } else {
            nameCount.set(fileName, 1)
        }

        return { ...item, imageFileName: fileName } // Return updated file
    })
}

// Function to insert suffix before the file extension
export const appendSuffixToFileName = (fileName: string, suffix: string): string => {
    const dotIndex = fileName.lastIndexOf('.') // Find the last dot for the extension
    if (dotIndex === -1) {
        // No extension found, just append suffix
        return `${fileName}-${suffix}`
    }

    const baseName = fileName.slice(0, dotIndex) // Extract the part before the dot
    const extension = fileName.slice(dotIndex) // Extract the dot and everything after
    return `${baseName}-${suffix}${extension}` // Combine with suffix inserted
}

export const removeDupeImages = async (imageFiles: any[]) => {
    const seen = new Map<string, any>() // Use a Map to store the largest file for each unique origin+pathname

    for (const item of imageFiles) {
        const uniqueIdentifier = `${item.url.origin}${item.url.pathname}`

        //logos should take precedence with duplicate filenames
        if (item.type === 'logo') {
            seen.set(uniqueIdentifier, item)
        } else {
            // Get the current largest file stored for this unique identifier
            const existingItem = seen.get(uniqueIdentifier)

            if (!existingItem) {
                // If no file exists yet for this uniqueIdentifier, add the current item
                seen.set(uniqueIdentifier, item)
            } else {
                // Compare sizes and keep the larger file

                if (existingItem.type != 'logo') {
                    const existingSize = await getFileSize(existingItem.fileContents)
                    const currentSize = await getFileSize(item.fileContents)

                    if (currentSize > existingSize) {
                        seen.set(uniqueIdentifier, item) // Replace with the larger file
                    }
                }
            }
        }
    }

    // Return the values of the Map, which now contain only the largest images
    return Array.from(seen.values())
}

// Helper function to get the file size
const getFileSize = async (fileContents: Buffer | Uint8Array | Blob): Promise<number> => {
    if (fileContents instanceof Buffer || fileContents instanceof Uint8Array) {
        return fileContents.length
    }
    if (fileContents instanceof Blob) {
        return fileContents.size
    }
    throw new Error('Unsupported file type')
}

export const updateImageObjWithLogo = (logoAnalysis: string | null, imageFiles: ImageFiles[]) => {
    if (logoAnalysis) {
        const srcMatch = logoAnalysis?.match(/<img\s[^>]*src="([^"]+)"/) //match the image tag src value
        const logoSrc = srcMatch ? srcMatch[1] : null

        // Update the type to 'logo' for all matching objects in the imageFiles array
        imageFiles.forEach((imageFile) => {
            if (imageFile.originalImageLink.includes(logoSrc || '')) {
                imageFile.type = 'logo'
            }
        })
    } else {
        console.log('No logo analysis result, imageFiles remain unchanged.')
    }

    return imageFiles
}

export const extractFormData = async (page: Page) => {
    return await page.evaluate(() => {
        // Define the structure for form data
        const forms = Array.from(document.querySelectorAll('form')).map((form) => {
            // Extract the form title (legend, h1, h2, etc.)
            const titleElement = form.querySelector('legend, h1, h2, h3, h4, h5, h6')
            const title = titleElement?.textContent?.trim() || null

            // Extract form fields, but only include fields with a valid label
            const fields = Array.from(form.querySelectorAll('input, select, textarea')).reduce((filteredFields, field) => {
                const name = field.getAttribute('name') || ''
                const type = field.getAttribute('type') || (field.tagName === 'TEXTAREA' ? 'textarea' : 'text')
                const label = field.closest('label')?.textContent?.trim() || document.querySelector(`label[for="${field.id}"]`)?.textContent?.trim() || null
                const placeholder = field.getAttribute('placeholder') || null
                const required = field.hasAttribute('required')

                // Only add the field to the array if it has a label
                if (label) {
                    filteredFields.push({ name, type, label, placeholder, required })
                }

                return filteredFields
            }, [] as Array<{ name: string; type: string; label: string; placeholder: string | null; required: boolean }>)

            return { title, fields }
        })

        return forms
    })
}

export const extractPageContent = async (page: Page) => {
    return await page.evaluate(() => {
        // Unwanted tags for content scrape
        const unwantedSelectors = ['nav', 'footer', 'script', 'style']

        unwantedSelectors.forEach((selector) => {
            document.querySelectorAll(selector).forEach((el) => el.remove())
        })

        // Remove <header> content without removing headline tags
        document.querySelectorAll('header *:not(h1):not(h2):not(h3):not(h4):not(h5):not(h6)').forEach((el) => {
            el.remove()
        })
        console.log('Extracted body text:', document.body)
        // Return visible text content
        const bodyText = document.body?.innerText || '' // Safeguard against undefined

        return bodyText.trim() // Trim whitespace
    })
}
export function hashUrl(url: string): string {
    return crypto.createHash('md5').update(url).digest('hex')
}
