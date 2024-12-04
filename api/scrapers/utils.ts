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
