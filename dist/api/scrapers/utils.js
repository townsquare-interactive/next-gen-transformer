import { convertUrlToApexId, createRandomFiveCharString } from '../../src/utilities/utils.js';
import crypto from 'crypto';
import { ScrapingError } from '../../src/utilities/errors.js';
export function preprocessImageUrl(itemUrl) {
    //a null or undefined URL should not be processed for Duda uploading
    if (!itemUrl) {
        console.error('URL is null or undefined:', itemUrl);
        return null;
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
        if (item.url) {
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
export const extractFormData = async (page) => {
    try {
        return await page.evaluate(() => {
            // Define the structure for form data
            const forms = Array.from(document.querySelectorAll('form')).map((form) => {
                // Extract the form title (legend, h1, h2, etc.)
                const titleElement = form.querySelector('legend, h1, h2, h3, h4, h5, h6');
                const title = titleElement?.textContent?.trim() || null;
                // Extract form fields, but only include fields with a valid label
                const fields = Array.from(form.querySelectorAll('input, select, textarea')).reduce((filteredFields, field) => {
                    const name = field.getAttribute('name') || '';
                    const type = field.getAttribute('type') || (field.tagName === 'TEXTAREA' ? 'textarea' : 'text');
                    const label = field.closest('label')?.textContent?.trim() || document.querySelector(`label[for="${field.id}"]`)?.textContent?.trim() || null;
                    const placeholder = field.getAttribute('placeholder') || null;
                    const required = field.hasAttribute('required');
                    // Only add the field to the array if it has a label
                    if (label) {
                        filteredFields.push({ name, type, label, placeholder, required });
                    }
                    return filteredFields;
                }, []);
                return { title, fields };
            });
            return forms;
        });
    }
    catch (error) {
        console.error('error extracting form data', error);
        throw error;
    }
};
export const extractPageContent = async (page) => {
    return await page.evaluate(() => {
        // Unwanted tags for content scrape
        const unwantedSelectors = ['nav', 'footer', 'script', 'style'];
        unwantedSelectors.forEach((selector) => {
            document.querySelectorAll(selector).forEach((el) => el.remove());
        });
        // Remove <header> content without removing headline tags
        document.querySelectorAll('header *:not(h1):not(h2):not(h3):not(h4):not(h5):not(h6)').forEach((el) => {
            el.remove();
        });
        console.log('Extracted body text:', document.body);
        // Return visible text content
        const bodyText = document.body?.textContent || ''; // Safeguard against undefined
        return bodyText.trim(); // Trim whitespace
    });
};
export function hashUrl(url) {
    return crypto.createHash('md5').update(url).digest('hex');
}
//remove unecessary elements from HTML before analyzing
export async function cleanseHtml(page) {
    const cleanedHtml = await page.evaluate(() => {
        const elementsToRemove = ['script', 'meta', 'noscript', 'link', 'svg'];
        elementsToRemove.forEach((selector) => {
            document.querySelectorAll(selector).forEach((el) => el.remove());
        });
        return document.body.innerHTML;
    });
    // Ensure it's within token limits
    return cleanedHtml.length > 100000 ? cleanedHtml.slice(0, 100000) : cleanedHtml;
}
export const checkPagesAreSameDomain = (basePath, domainToCheck) => {
    if (basePath === convertUrlToApexId(domainToCheck)) {
        return true;
    }
    else {
        return false;
    }
};
export const checkPagesAreOnSameDomain = (baseDomain, pages) => {
    const basePath = convertUrlToApexId(baseDomain);
    for (let x = 0; x < pages.length; x++) {
        if (!checkPagesAreSameDomain(basePath, pages[x])) {
            throw new ScrapingError({
                domain: baseDomain,
                message: 'Found pages to scrape are not all on the same domain',
                state: { scrapeStatus: 'Site not scraped', pages: pages },
                errorType: 'SCR-016',
            });
        }
    }
    return true;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9hcGkvc2NyYXBlcnMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLGtCQUFrQixFQUFFLDBCQUEwQixFQUFFLE1BQU0sOEJBQThCLENBQUE7QUFFN0YsT0FBTyxNQUFNLE1BQU0sUUFBUSxDQUFBO0FBQzNCLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQTtBQUU3RCxNQUFNLFVBQVUsa0JBQWtCLENBQUMsT0FBbUI7SUFDbEQsb0VBQW9FO0lBQ3BFLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNYLE9BQU8sQ0FBQyxLQUFLLENBQUMsMkJBQTJCLEVBQUUsT0FBTyxDQUFDLENBQUE7UUFDbkQsT0FBTyxJQUFJLENBQUE7SUFDZixDQUFDO0lBRUQsSUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFBO0lBRWpCLHdGQUF3RjtJQUN4RixNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUN6QyxNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFBO0lBRTdELE9BQU8sUUFBUSxDQUFBO0FBQ25CLENBQUM7QUFFRCxrQ0FBa0M7QUFDbEMsTUFBTSxDQUFDLE1BQU0sb0JBQW9CLEdBQUcsQ0FBQyxLQUFZLEVBQVMsRUFBRTtJQUN4RCxNQUFNLFNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBa0IsQ0FBQTtJQUUzQyxPQUFPLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtRQUN0QixJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFBO1FBRWpDLDhDQUE4QztRQUM5QyxJQUFJLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVB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