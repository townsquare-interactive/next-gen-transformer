import { createRandomFiveCharString } from '../../src/utilities/utils.js';
import crypto from 'crypto';
export function preprocessImageUrl(itemUrl) {
    if (!itemUrl) {
        console.error('URL is null or undefined:', itemUrl);
        throw new Error('Invalid URL: Cannot process');
    }
    let url = itemUrl;
    // Extract the actual S3 URL from the `url` query parameter, or fallback to the raw href
    const s3Url = url.searchParams.get('url');
    const finalUrl = s3Url ? decodeURIComponent(s3Url) : url.href;
    return finalUrl;
}
// Rename duplicate imageFileNames
export const renameDuplicateFiles = (files) => {
    const nameCount = new Map();
    return files.map((item) => {
        let fileName = item.imageFileName;
        // If the name already exists, append a suffix
        if (nameCount.has(fileName)) {
            nameCount.set(fileName, nameCount.get(fileName) + 1);
            const randomSuffix = createRandomFiveCharString();
            fileName = appendSuffixToFileName(fileName, randomSuffix); // Modify the filename before extension
        }
        else {
            nameCount.set(fileName, 1);
        }
        return { ...item, imageFileName: fileName }; // Return updated file
    });
};
// Function to insert suffix before the file extension
export const appendSuffixToFileName = (fileName, suffix) => {
    const dotIndex = fileName.lastIndexOf('.'); // Find the last dot for the extension
    if (dotIndex === -1) {
        // No extension found, just append suffix
        return `${fileName}-${suffix}`;
    }
    const baseName = fileName.slice(0, dotIndex); // Extract the part before the dot
    const extension = fileName.slice(dotIndex); // Extract the dot and everything after
    return `${baseName}-${suffix}${extension}`; // Combine with suffix inserted
};
export const removeDupeImages = async (imageFiles) => {
    const seen = new Map(); // Use a Map to store the largest file for each unique origin+pathname
    for (const item of imageFiles) {
        const uniqueIdentifier = `${item.url.origin}${item.url.pathname}`;
        //logos should take precedence with duplicate filenames
        if (item.type === 'logo') {
            seen.set(uniqueIdentifier, item);
        }
        else {
            // Get the current largest file stored for this unique identifier
            const existingItem = seen.get(uniqueIdentifier);
            if (!existingItem) {
                // If no file exists yet for this uniqueIdentifier, add the current item
                seen.set(uniqueIdentifier, item);
            }
            else {
                // Compare sizes and keep the larger file
                if (existingItem.type != 'logo') {
                    const existingSize = await getFileSize(existingItem.fileContents);
                    const currentSize = await getFileSize(item.fileContents);
                    if (currentSize > existingSize) {
                        seen.set(uniqueIdentifier, item); // Replace with the larger file
                    }
                }
            }
        }
    }
    // Return the values of the Map, which now contain only the largest images
    return Array.from(seen.values());
};
// Helper function to get the file size
const getFileSize = async (fileContents) => {
    if (fileContents instanceof Buffer || fileContents instanceof Uint8Array) {
        return fileContents.length;
    }
    if (fileContents instanceof Blob) {
        return fileContents.size;
    }
    throw new Error('Unsupported file type');
};
export const updateImageObjWithLogo = (logoAnalysis, imageFiles) => {
    if (logoAnalysis) {
        const srcMatch = logoAnalysis?.match(/<img\s[^>]*src="([^"]+)"/); //match the image tag src value
        const logoSrc = srcMatch ? srcMatch[1] : null;
        // Update the type to 'logo' for all matching objects in the imageFiles array
        imageFiles.forEach((imageFile) => {
            if (imageFile.originalImageLink.includes(logoSrc || '')) {
                imageFile.type = 'logo';
            }
        });
    }
    else {
        console.log('No logo analysis result, imageFiles remain unchanged.');
    }
    return imageFiles;
};
export function hashUrl(url) {
    return crypto.createHash('md5').update(url).digest('hex');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9hcGkvc2NyYXBlcnMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLDBCQUEwQixFQUFFLE1BQU0sOEJBQThCLENBQUE7QUFFekUsT0FBTyxNQUFNLE1BQU0sUUFBUSxDQUFBO0FBRTNCLE1BQU0sVUFBVSxrQkFBa0IsQ0FBQyxPQUFZO0lBQzNDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNYLE9BQU8sQ0FBQyxLQUFLLENBQUMsMkJBQTJCLEVBQUUsT0FBTyxDQUFDLENBQUE7UUFDbkQsTUFBTSxJQUFJLEtBQUssQ0FBQyw2QkFBNkIsQ0FBQyxDQUFBO0lBQ2xELENBQUM7SUFFRCxJQUFJLEdBQUcsR0FBRyxPQUFPLENBQUE7SUFFakIsd0ZBQXdGO0lBQ3hGLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ3pDLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUE7SUFFN0QsT0FBTyxRQUFRLENBQUE7QUFDbkIsQ0FBQztBQUVELGtDQUFrQztBQUNsQyxNQUFNLENBQUMsTUFBTSxvQkFBb0IsR0FBRyxDQUFDLEtBQVksRUFBUyxFQUFFO0lBQ3hELE1BQU0sU0FBUyxHQUFHLElBQUksR0FBRyxFQUFrQixDQUFBO0lBRTNDLE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO1FBQ3RCLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUE7UUFFakMsOENBQThDO1FBQzlDLElBQUksU0FBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO1lBQzFCLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLFNB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