import { Page } from 'playwright'
import { convertUrlToApexId, createRandomFiveCharString } from '../../utilities/utils.js'
import { ImageFiles } from './asset-scrape.js'
import crypto from 'crypto'
import { ScrapingError } from '../../utilities/errors.js'
import { BusinessHours, ScrapedPageData, ScreenshotData } from '../../schema/output-zod.js'

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
        // Extract src value from img tag
        const srcMatch = logoAnalysis.match(/src=["']([^"']+)["']/)
        const logoSrc = srcMatch ? srcMatch[1] : null

        if (logoSrc) {
            // Remove protocol and leading slashes from both URLs for comparison
            const normalizedLogoSrc = logoSrc.replace(/^(?:https?:)?\/\//, '')

            // Update the type to 'logo' for all matching objects in the imageFiles array
            imageFiles.forEach((imageFile) => {
                const normalizedImageLink = imageFile.originalImageLink.replace(/^(?:https?:)?\/\//, '')
                if (normalizedImageLink === normalizedLogoSrc) {
                    imageFile.type = 'logo'
                    console.log('Matched logo exactly:', imageFile.originalImageLink)
                }
            })
        }
    } else {
        console.log('No logo analysis provided, imageFiles remain unchanged.')
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
    const result = await page.evaluate(() => {
        // Unwanted tags for content scrape
        const unwantedSelectors = ['nav', 'footer', 'script', 'style']

        // Instead of removing, let's clone the body first
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = document.body.innerHTML

        // Remove unwanted elements from our clone
        unwantedSelectors.forEach((selector) => {
            tempDiv.querySelectorAll(selector).forEach((el) => el.remove())
        })

        // Handle header elements - only preserve heading tags
        tempDiv.querySelectorAll('header').forEach((header) => {
            // Find all heading elements in the header
            const headings = header.querySelectorAll('h1, h2, h3, h4, h5, h6')
            // Move only the heading elements to the header's parent
            headings.forEach((heading) => {
                header.parentNode?.insertBefore(heading, header)
            })
            // Remove the header and any remaining content
            header.remove()
        })

        // Get all text nodes and formatting elements
        const content: string[] = []
        const tagsToKeep = ['B', 'I', 'EM', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6']

        // Process all content in document order
        const walker = document.createTreeWalker(tempDiv, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT)

        let node
        while ((node = walker.nextNode())) {
            if (node.nodeType === 3) {
                // Check if any ancestor is a tag we're keeping
                let hasPreservedAncestor = false
                let current = node.parentElement
                while (current) {
                    if (current.tagName.match(/^H[1-6]$/) || tagsToKeep.includes(current.tagName)) {
                        hasPreservedAncestor = true
                        break
                    }
                    current = current.parentElement
                }

                // Only add text if it's not inside any preserved tag
                if (!hasPreservedAncestor) {
                    const text = node.textContent?.trim()
                    if (text) {
                        content.push(text)
                    }
                }
            } else if (node.nodeType === 1) {
                // Element node
                const element = node as HTMLElement
                if (element.tagName.match(/^H[1-6]$/) || tagsToKeep.includes(element.tagName)) {
                    content.push(element.outerHTML)
                }
            }
        }

        const finalContent = content
            .join(' ')
            .replace(/\t/g, ' ')
            .replace(/[ \t]+/g, ' ')
            .replace(/\n\s+/g, '\n')
            .replace(/\s+\n/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .split(/\n/)
            .map((line) => line.trim())
            .filter((line) => line)
            .join('\n\n')
            .trim()

        return finalContent
    })

    return result
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

// Helper function to normalize time format
const normalizeTimeFormat = (timeStr: string): string => {
    // Handle empty or invalid input
    if (!timeStr) return timeStr

    // Split into parts if it's a range
    const parts = timeStr.split('-').map((part) => part.trim())

    return parts
        .map((time) => {
            // Remove any dots from am/pm
            time = time.replace(/\./g, '')

            // Convert to lowercase for consistency
            time = time.toLowerCase()

            // If time doesn't include minutes, add :00
            if (!time.includes(':') && (time.includes('am') || time.includes('pm'))) {
                time = time.replace(/([0-9]+)(am|pm)/, '$1:00$2')
            }

            return time
        })
        .join(' - ')
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
                    // Normalize the time format if it's a string
                    normalizedHours[upperDay] = typeof value === 'string' ? normalizeTimeFormat(value) : null
                }
            })

            return normalizedHours
        } else {
            return null
        }
    }
    return null
}

export const transformScrapedPageData = (pages: ScrapedPageData[]) => {
    const newPages = []
    for (const page of pages) {
        const newPage = {
            ...page,
            title: (() => {
                const path = new URL(page.url).pathname.replace(/\.[^/.]+$/, '') // Remove file extension
                const segments = path.split('/').filter(Boolean) // Split path and remove empty segments
                const lastSegment = segments.length > 0 ? segments[segments.length - 1] : 'Home'
                return lastSegment
                    .replace(/-/g, ' ') // Replace hyphens with spaces
                    .replace(/\b\w/g, (char) => char.toUpperCase()) // Capitalize each word
            })(),
        }
        newPages.push(newPage)
    }
    return newPages
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
