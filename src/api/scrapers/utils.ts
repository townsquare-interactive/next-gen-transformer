import { Page } from 'playwright'
import { convertUrlToApexId, createRandomFiveCharString } from '../../utilities/utils.js'
import { ImageFiles } from './asset-scrape.js'
import crypto from 'crypto'
import { ScrapingError } from '../../utilities/errors.js'
import { BusinessHours, ScreenshotData } from '../../schema/output-zod.js'

export function preprocessImageUrl(itemUrl: URL | null): string | null {
    //a null or undefined URL should not be processed for Duda uploading
    if (!itemUrl) {
        console.error('URL is null or undefined:', itemUrl)
        return null
    }

    const url = itemUrl

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

export const removeDupeImages = async (imageFiles: ImageFiles[]) => {
    const seen = new Map<string, any>() // Use a Map to store the largest file for each unique origin+pathname

    for (const item of imageFiles) {
        if (item.url) {
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
    try {
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
    } catch (error) {
        console.error('error extracting form data', error)
        throw error
    }
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

        const bodyText = document.body?.textContent || '' // Safeguard against undefined

        const rawContent = bodyText.trim()

        //clean the content
        const cleanedContent = rawContent
            .replace(/\t/g, ' ') // Replace tabs with spaces
            .replace(/[ \t]+/g, ' ') // Replace multiple spaces/tabs with single space
            .replace(/\n\s+/g, '\n') // Remove whitespace at start of lines
            .replace(/\s+\n/g, '\n') // Remove whitespace at end of lines
            .replace(/\n{3,}/g, '\n\n') // Replace 3+ newlines with just 2
            .split(/\n/) // Split into lines
            .map((line) => line.trim()) // Trim each line
            .filter((line) => line) // Remove empty lines
            .join('\n\n') // Join with double newlines for paragraph spacing
            .trim() // Final trim of the whole text

        return cleanedContent
    })
}

export function hashUrl(url: string): string {
    return crypto.createHash('md5').update(url).digest('hex')
}

//remove unecessary elements from HTML before analyzing
export async function cleanseHtml(page: Page): Promise<string> {
    const cleanedHtml = await page.evaluate(() => {
        const elementsToRemove = ['script', 'meta', 'noscript', 'link', 'svg']
        elementsToRemove.forEach((selector) => {
            document.querySelectorAll(selector).forEach((el) => el.remove())
        })

        return document.body.innerHTML
    })

    // Ensure it's within token limits
    return cleanedHtml.length > 100000 ? cleanedHtml.slice(0, 100000) : cleanedHtml
}

export const checkPagesAreSameDomain = (basePath: string, domainToCheck: string): boolean => {
    if (basePath === convertUrlToApexId(domainToCheck)) {
        return true
    } else {
        return false
    }
}

export const checkPagesAreOnSameDomain = (baseDomain: string, pages: string[]) => {
    const basePath = convertUrlToApexId(baseDomain)
    for (let x = 0; x < pages.length; x++) {
        if (!checkPagesAreSameDomain(basePath, pages[x])) {
            throw new ScrapingError({
                domain: baseDomain,
                message: 'Found pages to scrape are not all on the same domain',
                state: { scrapeStatus: 'Site not scraped', pages: pages },
                errorType: 'SCR-016',
            })
        }
    }
    return true
}

export const transformBusinessInfo = (businessInfo: ScreenshotData, url: string) => {
    if (businessInfo.hours) {
        businessInfo.hours = transformHours(businessInfo)
    }

    //remove links from same domain in other section
    if (businessInfo?.links?.other) {
        const extLinks = businessInfo.links.other.filter((link: string) => !link.includes(url))
        businessInfo.links.other = extLinks
    }

    if (businessInfo.address) {
        businessInfo.address.country = 'US' //default to US
        console.log('businessInfo.address', businessInfo.address)
    }

    return businessInfo
}

const transformHours = (businessInfo: ScreenshotData) => {
    if (businessInfo.hours) {
        // If hours is just a string, return null for the hours object
        if (typeof businessInfo.hours === 'string') {
            return null
        }

        // Create a new hours object with all days initialized to null
        const normalizedHours: BusinessHours = {
            MON: null,
            TUE: null,
            WED: null,
            THU: null,
            FRI: null,
            SAT: null,
            SUN: null,
        }

        // Check if hours is an object and has valid day entries
        if (typeof businessInfo.hours === 'object') {
            const hours = businessInfo.hours
            Object.keys(hours).forEach((day) => {
                const upperDay = day.toUpperCase() as keyof typeof normalizedHours
                if (upperDay in normalizedHours) {
                    const value = hours[upperDay]
                    normalizedHours[upperDay] = typeof value === 'string' ? value : null
                }
            })

            return normalizedHours
        } else {
            return null
        }
    }
    return null
}

export interface ImageDimensions {
    width: number
    height: number
}

export const isTrackingOrGoogle = (url: URL, dimensions?: ImageDimensions): boolean => {
    // Common tracking pixel patterns
    const trackingPatterns = [/=FGET$/i, /gstatic\.com/i, /mt\.googleapis\.com/i]
    const isTrackingUrl = trackingPatterns.some((pattern) => pattern.test(url.href))

    const isTinyImage = dimensions && (dimensions.width <= 1 || dimensions.height <= 1 || (dimensions.width <= 3 && dimensions.height <= 3))

    return isTrackingUrl || !!isTinyImage
}

export const isValidImageType = (contentType: string): boolean => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
    return validTypes.includes(contentType.toLowerCase())
}

export const isValidImageSize = (fileSize: number): boolean => {
    const MIN_SIZE = 100 // 100 bytes
    const MAX_SIZE = 10 * 1024 * 1024 // 10MB
    return fileSize >= MIN_SIZE && fileSize <= MAX_SIZE
}

export const getImageDimensions = async (buffer: Buffer): Promise<ImageDimensions | null> => {
    try {
        const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength)

        // Check for PNG
        if (buffer[0] === 0x89 && buffer[1] === 0x50) {
            return {
                width: view.getUint32(16, false),
                height: view.getUint32(20, false),
            }
        }

        // Check for JPEG
        if (buffer[0] === 0xff && buffer[1] === 0xd8) {
            let pos = 2
            while (pos < buffer.length) {
                if (buffer[pos] === 0xff && buffer[pos + 1] === 0xc0) {
                    return {
                        height: view.getUint16(pos + 5, false),
                        width: view.getUint16(pos + 7, false),
                    }
                }
                pos++
            }
        }

        // Check for GIF
        if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
            // 'GIF' signature
            return {
                width: view.getUint16(6, true),
                height: view.getUint16(8, true),
            }
        }

        return null
    } catch (error) {
        console.error('Error getting image dimensions:', error)
        return null
    }
}
