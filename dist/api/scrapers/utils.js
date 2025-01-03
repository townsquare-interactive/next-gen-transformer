import { createRandomFiveCharString } from '../../src/utilities/utils.js';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9hcGkvc2NyYXBlcnMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLDBCQUEwQixFQUFFLE1BQU0sOEJBQThCLENBQUE7QUFHekUsTUFBTSxVQUFVLGtCQUFrQixDQUFDLE9BQVk7SUFDM0MsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ1gsT0FBTyxDQUFDLEtBQUssQ0FBQywyQkFBMkIsRUFBRSxPQUFPLENBQUMsQ0FBQTtRQUNuRCxNQUFNLElBQUksS0FBSyxDQUFDLDZCQUE2QixDQUFDLENBQUE7SUFDbEQsQ0FBQztJQUVELElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQTtJQUVqQix3RkFBd0Y7SUFDeEYsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDekMsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQTtJQUU3RCxPQUFPLFFBQVEsQ0FBQTtBQUNuQixDQUFDO0FBRUQsa0NBQWtDO0FBQ2xDLE1BQU0sQ0FBQyxNQUFNLG9CQUFvQixHQUFHLENBQUMsS0FBWSxFQUFTLEVBQUU7SUFDeEQsTUFBTSxTQUFTLEdBQUcsSUFBSSxHQUFHLEVBQWtCLENBQUE7SUFFM0MsT0FBTyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7UUFDdEIsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQTtRQUVqQyw4Q0FBOEM7UUFDOUMsSUFBSSxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7WUFDMUIsU0FBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUUsR0FB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