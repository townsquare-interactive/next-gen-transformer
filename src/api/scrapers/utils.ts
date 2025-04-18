import { Page } from 'playwright'
import { convertUrlToApexId, createRandomFiveCharString } from '../../utilities/utils.js'
import { ImageFiles } from './asset-scrape.js'
import crypto from 'crypto'
import { ScrapingError } from '../../utilities/errors.js'
import { BusinessHours, ScrapedAndAnalyzedSiteData, ScrapedPageData, ScreenshotData } from '../../schema/output-zod.js'
import { BusinessInfoData } from '../../services/duda/save-business-info.js'
import { ContentLibraryResponse } from '@dudadev/partner-api/dist/types/lib/content/types.js'

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

export const transformTextToDudaFormat = (
    pages: ScrapedAndAnalyzedSiteData['pages'],
    businessInfo: BusinessInfoData,
    url: string,
    currentBusinessInfo?: ContentLibraryResponse
) => {
    const currentTextsExist = currentBusinessInfo?.site_texts?.custom && currentBusinessInfo?.site_texts?.custom.length > 0

    const customTexts = pages.flatMap((page) => {
        if (!page.content) return []
        const chunks: string[] = []
        const content = (page.content || '').replace(/\n/g, '<br>') //add line breaks
        const chunkSize = 4000

        // Create the base label first
        const baseLabel = currentTextsExist ? `${page.title || ''} (${url})` : page.title || ''

        // If content is under the length limit, return single entry
        if (content.length <= chunkSize) {
            const result = {
                label: baseLabel,
                text: content,
            }
            return [result]
        }

        // Split content into chunks of exactly 4000 characters if page content is over limit
        for (let i = 0; i < content.length; i += chunkSize) {
            chunks.push(content.slice(i, i + chunkSize))
        }

        // Create array of labeled chunks
        const result = chunks.map((chunk, index) => {
            const label = chunks.length > 1 ? `${baseLabel} (Part ${index + 1})` : baseLabel
            return {
                label,
                text: chunk,
            }
        })

        return result
    })

    const fonts = businessInfo?.styles?.fonts
    let fontText
    if (fonts) {
        const headerFonts = fonts.headerFonts?.join(', ')
        const bodyFonts = fonts.bodyFonts?.join(', ')

        fontText = {
            label: 'Fonts',
            text: `Header Fonts: ${headerFonts || ''}<br><br>Body Fonts: ${bodyFonts || ''}`,
        }
        customTexts.push(fontText)
    }

    return customTexts
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
    if (str.includes('google')) return 'google'
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
export const transformBusinessHours = (businessHours?: BusinessHours) => {
    if (!businessHours) return undefined

    return (() => {
        const hours = Object.entries(businessHours).map(([day, hours]) => {
            if (!hours) return undefined

            const normalizedHours = hours.replace(/\s+to\s+/i, ' - ')
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
    const socialLinks = businessInfo?.links?.socials
    if (!socialLinks?.length) return {}

    const socialAccounts: Record<string, string> = {}

    socialLinks.forEach((link) => {
        try {
            const url = new URL(link)
            // Get the path without query parameters
            const pathSegments = url.pathname.split('/').filter(Boolean)
            let finalSegment = pathSegments[pathSegments.length - 1]

            if (finalSegment) {
                // Remove any query parameters if they exist
                finalSegment = finalSegment.split('?')[0]
                // Clean up any remaining special characters
                finalSegment = finalSegment.replace(/[^a-zA-Z0-9-_]/g, '')

                const type = determineSocialAccountType(link.toLowerCase())
                if (type && finalSegment && finalSegment.length < 61) {
                    socialAccounts[type] = finalSegment
                } else {
                    console.warn('Invalid URL in social links:', link)
                }
            }
        } catch (error) {
            console.warn('Invalid URL in social links:', link)
            console.error(error)
        }
    })

    return socialAccounts
}

export const combineSocialAccounts = (currentLocationInfo: ContentLibraryResponse['location_data'] | undefined, businessInfo: BusinessInfoData) => {
    if (currentLocationInfo?.social_accounts?.socialAccounts && !businessInfo?.links?.socials) {
        return currentLocationInfo.social_accounts.socialAccounts
    }

    if (currentLocationInfo?.social_accounts?.socialAccounts && businessInfo?.links?.socials) {
        const newSocialAccounts = transformSocialAccountsToDudaFormat(businessInfo)
        const currentAccounts = currentLocationInfo.social_accounts.socialAccounts

        // Merge accounts, keeping current values only if they're truthy
        return {
            ...newSocialAccounts,
            ...Object.fromEntries(Object.entries(currentAccounts).filter(([_, value]) => value)),
        }
    }

    if (businessInfo?.links?.socials) {
        return transformSocialAccountsToDudaFormat(businessInfo)
    }

    return {}
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
        country: 'US',
    }
    //Do we just return this new address and change the logic in the main function to be simpler?
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
