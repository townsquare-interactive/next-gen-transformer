import { Page } from 'playwright'
import { convertUrlToApexId, createRandomFiveCharString } from '../../utilities/utils.js'
import { ImageFiles } from './asset-scrape.js'
import crypto from 'crypto'
import { ScrapingError } from '../../utilities/errors.js'
import { BusinessHours, S3UploadedImageList, ScrapedAndAnalyzedSiteData, ScrapedHours, ScrapedPageData, ScreenshotData } from '../../schema/output-zod.js'
import { BusinessInfoData } from '../../services/duda/save-business-info.js'
import { ContentLibraryResponse } from '@dudadev/partner-api/dist/types/lib/content/types.js'
import { SaveGeneratedContentReq } from '../../schema/input-zod.js'

export function preprocessImageUrl(itemUrl: URL | null): string | null {
    //a null or undefined URL should not be processed for Duda uploading
    if (!itemUrl) {
        console.warn('URL is null or undefined:', itemUrl)
        return null
    }

    const url = itemUrl

    // Extract the actual S3 URL from the `url` query parameter, or fallback to the raw href
    const s3Url = url.searchParams.get('url')
    const finalUrl = s3Url ? decodeURIComponent(s3Url) : url.href

    return finalUrl
}

// Rename duplicate imageFileNames
export const renameDuplicateFiles = (files: ImageFiles[]): ImageFiles[] => {
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
    const seen = new Map<string, ImageFiles>() // Use a Map to store the largest file for each unique origin+pathname

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
        } else if (item.imageFileName === 'home-screenshot.jpg') {
            seen.set('home-screenshot.jpg', item)
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
                if (normalizedImageLink.includes(normalizedLogoSrc)) {
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

export const extractPageContent = async (page: Page, isHomePage: boolean) => {
    const result = await page.evaluate((isHomePage) => {
        // Unwanted tags for content scrape
        const unwantedSelectors = ['nav', 'script', 'style']

        if (!isHomePage) {
            // Remove common footer selectors from inner page scraping
            const footerSelectors = [
                'footer', // HTML5 semantic tag
                '.footer', // exact class match
                '#footer', // ID match
                '.site-footer',
                '.page-footer',
                '.main-footer',
                '.footer-container',
                '.container-footer',
                '.dmFooterContainer',
            ].join(', ')
            unwantedSelectors.push(footerSelectors)
        }

        // Clone the body html
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = document.body.innerHTML

        // Remove unwanted elements from our clone
        unwantedSelectors.forEach((selector) => {
            if (selector.includes(',')) {
                // Handle compound footer selectors
                tempDiv.querySelectorAll(selector).forEach((el) => el.remove())
            } else {
                tempDiv.querySelectorAll(selector).forEach((el) => el.remove())
            }
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
    }, isHomePage)

    return result
}

export function hashUrl(url: string): string {
    return crypto.createHash('md5').update(url).digest('hex')
}

//remove unecessary elements from HTML before analyzing
export async function cleanHtmlForAnalysis(page: Page): Promise<string> {
    const cleanedHtml = await page.evaluate(() => {
        const elementsToRemove = ['script', 'noscript', 'iframe', 'meta', 'svg', 'link']
        elementsToRemove.forEach((selector) => {
            document.querySelectorAll(selector).forEach((el) => {
                el.remove()
            })
        })

        // Find footer content
        const footerElement = document.querySelector('footer') || document.querySelector('#footer') || document.querySelector('.footer')
        const footerContent = footerElement?.outerHTML

        // Find all elements containing hours
        const hoursElements: Element[] = []

        try {
            // Check tags for hours content
            const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, div, span, p, label')
            for (let i = 0; i < elements.length; i++) {
                const elem = elements[i]
                const text = elem.textContent || ''
                if (text.toLowerCase().indexOf('hours') !== -1) {
                    // Check if this element is a child of an already found hours element
                    const isChildOfExisting = hoursElements.some((existing) => existing.contains(elem))
                    if (!isChildOfExisting) {
                        const container = elem.parentElement
                        if (container && container !== document.body && !document.body.isSameNode(container) && hoursElements.indexOf(container) === -1) {
                            hoursElements.push(container)
                        }
                    }
                }
            }
        } catch (error) {
            console.warn('Error analyzing hours:', error)
        }

        if (hoursElements.length <= 0) {
            // Check common hours-related classes
            const hoursSelectors = ['.hours', '#hours', '[class*="hours"]', '.business-hours', '.store-hours', '.opening-hours', '.operating-hours']

            hoursSelectors.forEach((selector) => {
                const elements = document.querySelectorAll(selector)
                elements.forEach((el) => {
                    if (!hoursElements.includes(el)) {
                        hoursElements.push(el)
                    }
                })
            })
        }

        // Collect hours content first
        let hoursContent = ''
        hoursElements.forEach((el) => {
            hoursContent += el.outerHTML
        })

        // Remove the pushed up elements
        if (footerElement) {
            footerElement.remove()
        }
        hoursElements.forEach((el) => {
            el.remove()
        })

        // Create the new HTML structure
        const finalHtml = `
                ${hoursContent}
                ${footerContent || ''}
                ${document.body.innerHTML}
            `
        return finalHtml
    })

    // Ensure it's within token limits
    const truncatedHtml = cleanedHtml.length > 100000 ? cleanedHtml.slice(0, 100000) : cleanedHtml

    return truncatedHtml
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

const parseScrapedPhoneNumber = (phoneNumber: string) => {
    if (phoneNumber) {
        return phoneNumber.replaceAll('–', '-') //replace double dash with single dash
    }
    return null
}

export const transformBusinessInfo = (businessInfo: ScreenshotData, url: string) => {
    if (businessInfo.hours?.regularHours) {
        businessInfo.hours = { ...businessInfo.hours, regularHours: transformHours(businessInfo) }
    }

    if (businessInfo.phoneNumber) {
        businessInfo.phoneNumber = parseScrapedPhoneNumber(businessInfo.phoneNumber) //replace double dash with single dash
    }

    //remove links from same domain in other section
    if (businessInfo?.links?.other) {
        const extLinks = businessInfo.links.other.filter((link: string | null) => !link?.includes(url))
        businessInfo.links.other = extLinks
    }

    if (businessInfo.address) {
        businessInfo.address.country = 'US' //default to US
        console.log('businessInfo.address', businessInfo.address)
    }

    return businessInfo
}

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
    if (businessInfo.hours?.regularHours) {
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

        const regularHours = businessInfo.hours?.regularHours
        // Check if hours is an object and has valid day entries
        if (typeof regularHours === 'object') {
            const hours = regularHours
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

export const convertTitleToReadableFormat = (url: string) => {
    return (() => {
        const path = new URL(url).pathname.replace(/\.[^/.]+$/, '') // Remove file extension
        const segments = path.split('/').filter(Boolean) // Split path and remove empty segments
        const lastSegment = segments.length > 0 ? segments[segments.length - 1] : 'Home'
        return lastSegment
            .replace(/-/g, ' ') // Replace hyphens with spaces
            .replace(/\b\w/g, (char: string) => char.toUpperCase()) // Capitalize each word
    })()
}

export const transformScrapedPageData = (pages: ScrapedPageData[]) => {
    const newPages = []
    for (const page of pages) {
        const newPage = {
            ...page,
            title: convertTitleToReadableFormat(page.url),
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

const filterContent = (content: string) => {
    let filteredContent = content
    filteredContent = filteredContent.replace(/\n/g, '<br>') //add line breaks
    filteredContent = filteredContent.replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Remove emojis and symbols
    filteredContent = filteredContent.replace(/[\u{FE00}-\u{FE0F}]/gu, '') // Remove variation selectors
    filteredContent = filteredContent.replace(/[\u{1F000}-\u{1F02F}]/gu, '') // Remove additional emojis
    filteredContent = filteredContent.replace(/[^\p{L}\p{N}\p{P}\p{Z}\u0020-\u00FF]/gu, '') // Keep letters, numbers, punctuation, spaces, and basic Latin characters
    filteredContent = filteredContent.replace(/[ \t]+/g, ' ')

    return filteredContent
}

interface ServiceContent {
    label: string
    text: string
}

// Helper function to chunk and label content
function createContentChunks(content: string, baseLabel: string, chunkSize: number = 4000) {
    // If content is under the length limit, return single entry
    if (content.length <= chunkSize) {
        return [
            {
                label: baseLabel,
                text: content,
            },
        ]
    }

    const chunks: string[] = []
    // Split content into chunks of exactly 4000 characters
    for (let i = 0; i < content.length; i += chunkSize) {
        chunks.push(content.slice(i, i + chunkSize))
    }

    // Create array of labeled chunks
    return chunks.map((chunk, index) => ({
        label: chunks.length > 1 ? `${baseLabel} (Part ${index + 1})` : baseLabel,
        text: chunk,
    }))
}

export function transformAIContent(data: SaveGeneratedContentReq): ServiceContent[] {
    const services: ServiceContent[] = []
    const contentLabelPostfix = 'AI'

    // Add homepage content first if it exists and is not empty
    if (data.homepage_content && data.homepage_content.trim() !== '') {
        const homeLabel = `Home ${contentLabelPostfix}`
        services.push(...createContentChunks(data.homepage_content, homeLabel))
    }

    // Find all service keys and get the maximum number
    const serviceKeys = Object.keys(data)
        .filter((key) => key.match(/^service_\d+_name$/))
        .map((key) => parseInt(key.match(/\d+/)?.[0] || '0'))

    const maxServiceNumber = Math.max(...serviceKeys, 0)

    // Loop through all available services
    for (let i = 1; i <= maxServiceNumber; i++) {
        const nameKey = `service_${i}_name` as keyof SaveGeneratedContentReq
        const contentKey = `service_${i}_content` as keyof SaveGeneratedContentReq

        // Only add to array if both name and content exist
        if (data[nameKey] && data[contentKey]) {
            const serviceLabel = `${data[nameKey]} ${contentLabelPostfix}`
            services.push(...createContentChunks(data[contentKey] as string, serviceLabel))
        }
    }

    return services
}

export const transformTextToDudaFormat = (
    pages: ScrapedAndAnalyzedSiteData['pages'],
    businessInfo: BusinessInfoData,
    skippedLinks: string[],
    iframeContent?: string[],
    mediaLinks?: S3UploadedImageList[]
) => {
    const customTexts = pages.flatMap((page) => {
        if (!page.content) return []
        const content = filterContent(page.content || '')
        const baseLabel = `${page.title || ''}: ${page.url}`

        return createContentChunks(content, baseLabel)
    })

    // Add fonts if they exist
    const fonts = businessInfo?.styles?.fonts
    if (fonts) {
        const headerFonts = fonts.headerFonts?.join(', ')
        const bodyFonts = fonts.bodyFonts?.join(', ')

        const fontText = {
            label: 'Fonts',
            text: `Header Fonts: ${headerFonts || ''}<br><br>Body Fonts: ${bodyFonts || ''}`,
        }
        const fontTextChunks = createContentChunks(fontText.text, fontText.label)
        customTexts.push(...fontTextChunks)
    }

    // Add skipped links
    if (skippedLinks && skippedLinks.length) {
        const skippedLinksText = {
            label: 'Social Media',
            text: skippedLinks.join('<br>'),
        }
        const skippedLinksTextChunks = createContentChunks(skippedLinksText.text, skippedLinksText.label)
        customTexts.push(...skippedLinksTextChunks)
    }

    if ((iframeContent && iframeContent.length > 0) || (mediaLinks && mediaLinks.length > 0)) {
        //needed for uploading to Duda
        const encodeIframeHtml = (html: string): string => {
            return html.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#x27;').replace(/"/g, '&quot;')
        }

        const mediaText = {
            label: 'Media Files',
            text: `<h3>Files</h3><br>${
                mediaLinks
                    ?.map((link) => link.src)
                    .filter(Boolean)
                    .join('<br><br>') || ''
            }<br><br><h3>Iframe Content</h3><br>${iframeContent?.map(encodeIframeHtml).join('<br><br>') || ''}`,
        }

        const mediaTextChunks = createContentChunks(mediaText.text, mediaText.label)
        customTexts.push(...mediaTextChunks)
    }

    // Add address
    const addressText = {
        label: 'Address',
        text:
            !businessInfo?.address?.streetAddress && !businessInfo?.address?.city && !businessInfo?.address?.state
                ? ''
                : `${businessInfo?.address?.streetAddress ? businessInfo?.address?.streetAddress + '<br>' : ''}${businessInfo?.address?.city || ''}, ${
                      businessInfo?.address?.state || ''
                  }<br>${businessInfo?.address?.postalCode || ''}`,
    }
    const addressTextChunks = createContentChunks(addressText.text, addressText.label)
    customTexts.push(...addressTextChunks)

    return customTexts
}

export const transformContentToBusinessInfo = (formattedContent: ServiceContent[]) => {
    return {
        site_texts: {
            custom: formattedContent,
        },
    }
}

// Common street direction abbreviations
const DIRECTION_ABBREVIATIONS: Record<string, string> = {
    north: 'n',
    south: 's',
    east: 'e',
    west: 'w',
    northeast: 'ne',
    northwest: 'nw',
    southeast: 'se',
    southwest: 'sw',
}

// Common street type abbreviations
const STREET_TYPE_ABBREVIATIONS: Record<string, string> = {
    street: 'st',
    road: 'rd',
    avenue: 'ave',
    boulevard: 'blvd',
    drive: 'dr',
    lane: 'ln',
    place: 'pl',
    court: 'ct',
    circle: 'cir',
    way: 'way',
    highway: 'hwy',
    parkway: 'pkwy',
}

const normalizeAddress = (address: string): string => {
    if (!address) return ''

    // Convert to lowercase
    let normalized = address.toLowerCase()

    // Remove any extra spaces
    normalized = normalized.replace(/\s+/g, ' ').trim()

    // Replace direction words with abbreviations
    Object.entries(DIRECTION_ABBREVIATIONS).forEach(([word, abbr]) => {
        const regex = new RegExp(`\\b${word}\\b`, 'g')
        normalized = normalized.replace(regex, abbr)
    })

    // Replace street type words with abbreviations
    Object.entries(STREET_TYPE_ABBREVIATIONS).forEach(([word, abbr]) => {
        const regex = new RegExp(`\\b${word}\\b`, 'g')
        normalized = normalized.replace(regex, abbr)
    })

    // Remove special characters except numbers and letters
    normalized = normalized.replace(/[^a-z0-9\s]/g, '')

    return normalized
}

const calculateStringSimilarity = (str1: string, str2: string): number => {
    if (str1 === str2) return 1.0
    if (!str1 || !str2) return 0.0

    const len1 = str1.length
    const len2 = str2.length

    // Use Levenshtein distance
    const matrix: number[][] = Array(len1 + 1)
        .fill(null)
        .map(() => Array(len2 + 1).fill(0))

    for (let i = 0; i <= len1; i++) matrix[i][0] = i
    for (let j = 0; j <= len2; j++) matrix[0][j] = j

    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1, // deletion
                matrix[i][j - 1] + 1, // insertion
                matrix[i - 1][j - 1] + cost // substitution
            )
        }
    }

    // Convert distance to similarity score (0 to 1)
    const maxLength = Math.max(len1, len2)
    const distance = matrix[len1][len2]
    return 1 - distance / maxLength
}

export const calculateAddressSimilarity = (newAddress: string, currentAddress: string) => {
    //check address with similarity
    const SIMILARITY_THRESHOLD = 0.5 // 70% similarity threshold

    // Extract and compare street numbers first
    const extractStreetNumber = (address: string): string => {
        const match = address.match(/^(\d+)/)
        return match ? match[1] : ''
    }

    const newStreetNumber = extractStreetNumber(newAddress)
    const currentStreetNumber = extractStreetNumber(currentAddress)

    // If both addresses have street numbers, they must match exactly
    if (newStreetNumber && currentStreetNumber && newStreetNumber !== currentStreetNumber) {
        console.log('Debug - Street numbers do not match:', {
            newStreetNumber,
            currentStreetNumber,
        })
        return false
    }

    const normalizedNew = normalizeAddress(newAddress)
    const normalizedCurrent = normalizeAddress(currentAddress)
    console.log('Debug - Normalized addresses:', {
        original1: newAddress,
        normalized1: normalizedNew,
        original2: currentAddress,
        normalized2: normalizedCurrent,
    })

    const similarity = calculateStringSimilarity(normalizedNew, normalizedCurrent)
    console.log('Debug - Address similarity score:', similarity)
    return similarity >= SIMILARITY_THRESHOLD
}

export const determineIfLocationsMatch = (newBusinessInfo: BusinessInfoData, currentBusinessInfo: ContentLibraryResponse['location_data']) => {
    let samePhone = false
    let sameAddress = false

    //check phone
    //strip non-numeric characters
    const newPhoneNumber = newBusinessInfo?.phoneNumber?.replace(/\D/g, '')
    const currentPhoneNumber = currentBusinessInfo?.phones?.[0]?.phoneNumber?.replace(/\D/g, '')
    samePhone = newPhoneNumber === currentPhoneNumber

    if (newBusinessInfo?.address?.streetAddress && currentBusinessInfo?.address?.streetAddress) {
        sameAddress = calculateAddressSimilarity(newBusinessInfo?.address?.streetAddress, currentBusinessInfo?.address?.streetAddress)
    }

    if (samePhone || sameAddress) {
        return true
    }
    return false
}

export const determineSocialAccountType = (str: string) => {
    if (str.includes('facebook')) return 'facebook'
    if (str.includes('instagram')) return 'instagram'
    if (str.includes('twitter')) return 'twitter'
    if (str.includes('linkedin')) return 'linkedin'
    if (str.includes('youtube') || str.includes('youtu.be')) return 'youtube'
    if (str.includes('pinterest')) return 'pinterest'
    if (str.includes('vimeo')) return 'vimeo'
    if (str.includes('/x.com')) return 'twitter'
    if (str.includes('tiktok')) return 'tiktok'
    if (str.includes('yelp')) return 'yelp'
    if (str.includes('foursquare')) return 'foursquare'
    if (str.includes('rss')) return 'rss'
    if (str.includes('reddit')) return 'reddit'
    if (str.includes('tripadvisor')) return 'tripadvisor'
    if (str.includes('snapchat')) return 'snapchat'
    return null
}

type DayType = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'
export const transformHoursToDudaFormat = (hours?: ScrapedHours | null) => {
    if (!hours) return undefined
    const businessHours = hours.regularHours

    //Handle 24/7 hours
    if (hours.is24Hours) {
        return [
            {
                days: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as DayType[],
                open: '00:00',
                close: '24:00',
            },
        ]
    }

    if (!businessHours) return undefined

    return (() => {
        const hours = Object.entries(businessHours).map(([day, hours]) => {
            if (!hours) return undefined

            const normalizedHours = hours.replace(/\s+to\s+/i, ' - ').replace(/[–—−]/g, '-') // normalize en-dash, em-dash, to, and minus sign to hyphen
            let [open, close] = normalizedHours.split('-').map((str: string) => str.trim())

            const formatTime = (time: string) => {
                time = time.replace(/\./g, '').replace(/\s+/g, '')
                time = time.toLowerCase()
                if (!time.includes(':')) {
                    time = time.replace(/^(\d{1,2})(am|pm)$/, '$1:00$2')
                }
                const match = time.match(/^(\d{1,2}):?(\d{2})?\s*(am|pm)?$/i)
                if (!match) return ''
                const [, hour, minute = '00', period] = match
                let hourNum = parseInt(hour, 10)
                if (period) {
                    if (period.toLowerCase() === 'pm' && hourNum < 12) {
                        hourNum += 12
                    } else if (period.toLowerCase() === 'am' && hourNum === 12) {
                        hourNum = 0
                    }
                }
                return `${String(hourNum).padStart(2, '0')}:${minute}`
            }

            if (!open || !close) return undefined
            open = formatTime(open)
            close = formatTime(close)
            if (!open || !close) return undefined
            if (close === '24:00') close = '00:00'
            return { days: [day as DayType], open, close }
        })

        const validHours = hours.filter((entry): entry is { days: DayType[]; open: string; close: string } => entry !== undefined)
        return validHours.length > 0 ? validHours : undefined
    })()
}

export const transformSocialAccountsToDudaFormat = (businessInfo: BusinessInfoData) => {
    const socialLinks = [...(businessInfo?.links?.socials || [])]

    // Check other links for Google My Business to push to social links
    const otherLinks = businessInfo?.links?.other || []
    const googleBusinessLink = otherLinks.find((link) => link?.includes('google.com/maps/place'))
    if (googleBusinessLink) {
        socialLinks.push(googleBusinessLink)
    }

    if (!socialLinks.length) return { socialAccounts: {}, skippedLinks: [] }

    const socialAccounts: Record<string, string> = {}
    const skippedLinks: string[] = []

    socialLinks.forEach((link) => {
        try {
            if (!link) return

            // Special handling for Google My Business links
            if (link.includes('google.com/maps/place')) {
                const placeIndex = link.indexOf('/place/')
                if (placeIndex !== -1) {
                    const placeData = link.slice(placeIndex + 7) // +7 to skip '/place/'
                    if (placeData.length > 200) {
                        //max character limit for Duda GMB links
                        skippedLinks.push(link)
                        return
                    }
                    socialAccounts['google_my_business'] = placeData
                    return
                }
            }

            const url = new URL(link)
            const type = determineSocialAccountType(link.toLowerCase())

            if (type) {
                let typeLimit = 60
                if (type === 'facebook') {
                    typeLimit = 200
                }
                if (type === 'facebook' && url.pathname.includes('profile.php') && url.searchParams.get('id')) {
                    // Special handling for Facebook profile IDs
                    const profileId = url.searchParams.get('id')
                    if (profileId && profileId.length < 61) {
                        socialAccounts[type] = `profile.php?id=${profileId}`
                    } else {
                        skippedLinks.push(link)
                        console.warn('Invalid Facebook profile ID:', link)
                    }
                } else {
                    // Regular handling for other social media URLs
                    const fullPath = url.pathname
                        .replace(/^\/|\/$/g, '') // Remove leading/trailing slashes
                        .split('?')[0] // Remove query parameters
                        .replace(/[^\w\/-]/g, '') // Remove special chars except for alphanumeric, hyphens, and forward slashes

                    if (fullPath && fullPath.length <= typeLimit) {
                        socialAccounts[type] = fullPath
                    } else {
                        skippedLinks.push(link)
                        console.warn('Invalid URL in social links:', link)
                    }
                }
            } else {
                skippedLinks.push(link)
                console.warn('Unknown social media type:', link)
            }
        } catch (error) {
            console.warn('Invalid URL in social links:', link)
            console.error(error)
        }
    })

    return { socialAccounts, skippedLinks }
}

export const combineSocialAccounts = (currentLocationInfo: ContentLibraryResponse['location_data'] | undefined, businessInfo: BusinessInfoData) => {
    if (currentLocationInfo?.social_accounts?.socialAccounts && !businessInfo?.links?.socials) {
        return {
            socialAccounts: currentLocationInfo.social_accounts.socialAccounts,
            skippedLinks: undefined,
        }
    }

    if (currentLocationInfo?.social_accounts?.socialAccounts && businessInfo?.links?.socials) {
        const { socialAccounts, skippedLinks } = transformSocialAccountsToDudaFormat(businessInfo)
        const newSocialAccounts = socialAccounts
        const currentAccounts = currentLocationInfo.social_accounts.socialAccounts

        // Merge accounts, keeping current values only if they're truthy
        return {
            socialAccounts: {
                ...newSocialAccounts,
                ...Object.fromEntries(Object.entries(currentAccounts).filter(([_, value]) => value)),
            },
            skippedLinks,
        }
    }

    if (businessInfo?.links?.socials) {
        const { socialAccounts, skippedLinks } = transformSocialAccountsToDudaFormat(businessInfo)
        return {
            socialAccounts,
            skippedLinks,
        }
    }

    return {
        socialAccounts: {},
        skippedLinks: [],
    }
}

export const createCombinedAddress = (businessInfo: BusinessInfoData, currentBusinessInfo: ContentLibraryResponse) => {
    const currentAddress = currentBusinessInfo?.location_data?.address
    const currentStreetAddress = currentAddress?.streetAddress
    const locationsMatch = determineIfLocationsMatch(businessInfo, currentBusinessInfo.location_data)
    let addSecondLocation = false
    let combinedBusinessAddress = businessInfo?.address

    //One location combining of info
    if (!currentStreetAddress) {
        addSecondLocation = false

        //current address is partial with no street address and new has street address
        /* if (currentAddress?.postalCode && currentAddress?.city && businessInfo?.address?.streetAddress) {
        const combinedBusinessAddress = {
            ...businessInfo.address,
        }
        businessInfo.address = combinedBusinessAddress
    } */
    } else if (!locationsMatch) {
        //current street exists and they don't match
        addSecondLocation = true
    }
    //current location exists and they match (or partial)
    if (currentStreetAddress && !businessInfo?.address?.streetAddress) {
        combinedBusinessAddress = currentAddress
    }

    const newAddressData = {
        streetAddress: addSecondLocation ? currentBusinessInfo?.location_data?.address?.streetAddress || '' : combinedBusinessAddress?.streetAddress ?? '',
        city: addSecondLocation ? currentBusinessInfo?.location_data?.address?.city || '' : combinedBusinessAddress?.city ?? '',
        postalCode: addSecondLocation ? currentBusinessInfo?.location_data?.address?.postalCode || '' : combinedBusinessAddress?.postalCode ?? '',
        state: addSecondLocation ? currentBusinessInfo?.location_data?.address?.region || '' : combinedBusinessAddress?.state ?? '',
        country: 'US',
    }

    return {
        addSecondLocation,
        newAddressData,
    }
}

export const isStockImage = (url: URL): boolean => {
    // Common stock photo domains
    const stockDomains = [
        'shutterstock.com',
        'istockphoto.com',
        'stock.adobe.com',
        'gettyimages.com',
        'dreamstime.com',
        'depositphotos.com',
        'alamy.com',
        '123rf.com',
        'stockphoto.com',
        'bigstockphoto.com',
    ]

    // Check if URL is from a stock photo domain
    if (stockDomains.some((domain) => url.hostname.includes(domain))) {
        return true
    }

    // Check filename patterns indicating stock photos
    const stockPatterns = [/stock[_-]?photo/i, /shutterstock/i, /istock/i, /getty/i, /bigstock/i, /depositphotos/i, /adobe[_-]?stock/i]

    const filename = url.pathname.split('/').pop() || ''
    return stockPatterns.some((pattern) => pattern.test(filename))
}

export const createBusinessInfoDocument = (scrapedData: ScrapedAndAnalyzedSiteData) => {
    // Format hours
    const formatHours = (hours?: ScrapedHours | null) => {
        if (!hours) {
            return 'N/A'
        }
        if (hours.is24Hours) {
            return 'Open 24 Hours'
        }

        const regularHours = hours.regularHours
        if (!regularHours) {
            return 'N/A'
        }

        // Define days with proper type
        const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const
        type DayKey = (typeof days)[number]

        return days
            .map((day: DayKey) => {
                const hourString = regularHours[day]
                return hourString ? `${day}: ${hourString}` : `${day}: Closed`
            })
            .join('\n        ') // Extra indentation for readability
    }

    // Format page content with indentation
    const formatPageContent = (content: string | null) => {
        if (!content) {
            return ''
        }

        const lines = content
            // .replace(/\s+/g, ' ')
            .trim()
            .split(/\n|(?=<h[1-6])/g) // Split on newlines or before headers
            .map((line) => `    ${line}`) // Add 4 spaces of indentation
            .join('\n')

        return lines
    }

    // Format address
    const formatAddress = (address: ScreenshotData['address']) => {
        if (!address) return 'N/A'

        return `
        Street:  ${address.streetAddress || 'N/A'}
        City:    ${address.city || 'N/A'}
        State:   ${address.state || 'N/A'}
        Zip:     ${address.postalCode || 'N/A'}
        Country: ${address.country || 'N/A'}`
    }

    // Create text content
    const textContent = `
    =====================================
    BUSINESS INFORMATION
    =====================================
    Company Name: ${scrapedData.businessInfo?.companyName || 'N/A'}

    Contact Details:
    ---------------
        Phone:   ${scrapedData.businessInfo?.phoneNumber || 'N/A'}
        Email:   ${scrapedData.businessInfo?.email || 'N/A'}
        Address: ${scrapedData.businessInfo?.address ? formatAddress(scrapedData.businessInfo.address) : 'N/A'}

    Business Hours:
    -------------
        ${formatHours(scrapedData.businessInfo?.hours)}

    =====================================
    PAGE CONTENT
    =====================================
    ${scrapedData.pages
        .map(
            (page) => `
    ---------------
    ${page.title ? page.title.toUpperCase() : ''}
    ---------------
    ${formatPageContent(page.content)}
    `
        )
        .join('\n\n')}
    `

    return textContent
}

export function isValidMediaType(contentType: string): boolean {
    return isValidImageType(contentType) || isValidAudioVideoType(contentType)
}

export function isValidAudioVideoType(contentType: string): boolean {
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'audio/mpeg', 'audio/mp3', 'video/quicktime']
    return validTypes.includes(contentType.toLowerCase())
}

export function isValidMediaSize(fileSize: number): boolean {
    const MAX_MEDIA_SIZE = 150 * 1024 * 1024 // 150MB max
    const MIN_MEDIA_SIZE = 1024 // 1KB min
    return fileSize >= MIN_MEDIA_SIZE && fileSize <= MAX_MEDIA_SIZE
}

export const isAnalyzePage = (page: string, analyzeContactPage: boolean) => {
    try {
        if (analyzeContactPage) {
            //extract slug from url
            const url = new URL(page)
            const slug =
                url.pathname
                    .toLowerCase()
                    .split('/')
                    .filter((segment) => segment.length > 0)
                    .pop() || ''

            return slug.includes('contact')
        }
    } catch (error) {
        console.warn('Error determining if page needs analysis:', error)
    }
    return false
}

export const validHours = (hours?: ScrapedHours | null) => {
    if (!hours || hours.regularHours === null) {
        return false
    }

    const hoursNull = Object.values(hours.regularHours).every((hour) => hour === null)
    const foundHours = !hoursNull
    return foundHours
}

export const combineBusinessData = (homepageData: ScreenshotData | undefined, internalPagesData: (ScreenshotData | undefined)[]) => {
    if (!homepageData) return null

    const combinedData: ScreenshotData = { ...homepageData }

    // Filter out undefined/null data from other pages
    const validInternalPagesData = internalPagesData.filter((data): data is ScreenshotData => !!data)

    for (const internalPageData of validInternalPagesData) {
        // Check and merge hours data
        if (!validHours(combinedData.hours)) {
            combinedData.hours = internalPageData.hours
        }

        // Check and other business data
        if (!combinedData.address || Object.values(combinedData.address).every((field) => !field)) {
            combinedData.address = internalPageData.address
        }
        if (!combinedData.email) combinedData.email = internalPageData.email
        if (!combinedData.phoneNumber) combinedData.phoneNumber = internalPageData.phoneNumber
    }

    return combinedData
}
