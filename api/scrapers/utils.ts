const seenUrls = new Set<string>()
export function preprocessImageUrl(itemUrl: any): string | null {
    // Ensure itemUrl is an instance of URL or convert it
    console.log('Processing item URL:', itemUrl)
    let url = itemUrl
    /*try {
        url = itemUrl instanceof URL ? itemUrl : new URL(itemUrl)
    } catch (error) {
        console.error('Invalid URL format:', itemUrl)
        throw new Error('Invalid URL: Cannot process')
    } */

    if (!itemUrl) {
        console.error('URL is null or undefined:', itemUrl)
        throw new Error('Invalid URL: Cannot process')
    }
    //url = itemUrl instanceof URL ? itemUrl : new URL(itemUrl)

    // Check if the "url" search param exists (this selects the true image source instead of a Next.js proxy version)
    const s3Url = url.searchParams.get('url')
    if (!s3Url) {
        console.error('Missing "url" parameter in:', itemUrl.href)
        throw new Error('Invalid URL: Cannot process')
    }

    const finalUrl = s3Url ? decodeURIComponent(s3Url) : url.toString()

    // Check for duplicates (the duda fetch will fail with an internal service failure if there are duplicates)
    if (seenUrls.has(finalUrl)) {
        console.warn(`Duplicate image detected: ${finalUrl}`)
        return null // Skip this URL
    }

    seenUrls.add(finalUrl) // Mark as seen
    console.log('the final url', finalUrl)
    return finalUrl
}
