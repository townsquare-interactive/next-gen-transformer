import { createRandomFiveCharString } from '../../src/utilities/utils.js'

export function preprocessImageUrl(itemUrl: any): string | null {
    console.log('Processing item URL:', itemUrl)

    if (!itemUrl) {
        console.error('URL is null or undefined:', itemUrl)
        throw new Error('Invalid URL: Cannot process')
    }

    let url = itemUrl

    // Extract the actual S3 URL from the `url` query parameter, or fallback to the raw href
    const s3Url = url.searchParams.get('url')
    const finalUrl = s3Url ? decodeURIComponent(s3Url) : url.href

    console.log('Processed final URL:', finalUrl)
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

        // Get the current largest file stored for this unique identifier
        const existingItem = seen.get(uniqueIdentifier)

        if (!existingItem) {
            // If no file exists yet for this uniqueIdentifier, add the current item
            seen.set(uniqueIdentifier, item)
        } else {
            // Compare sizes and keep the larger file
            const existingSize = await getFileSize(existingItem.fileContents)
            const currentSize = await getFileSize(item.fileContents)

            if (currentSize > existingSize) {
                seen.set(uniqueIdentifier, item) // Replace with the larger file
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
