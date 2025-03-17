function validateScrapeResponse(req, res, context, events, done) {
    // Skip validation if response is not 200
    if (res.statusCode !== 200) {
        console.log(`Request failed with status ${res.statusCode}:`, res.body)
        return done()
    }

    try {
        const body = JSON.parse(res.body)

        // Track custom metrics
        events.emit('counter', 'images_uploaded', body?.dataUploadDetails?.imageUploadTotal || 0)

        // Track if site data was saved
        if (body?.dataUploadDetails?.siteDataUrl) {
            events.emit('counter', 'site_data_saved', 1)
        }

        // Track failed images
        if (body?.dataUploadDetails?.failedImageList?.length > 0) {
            events.emit('counter', 'failed_images', body.dataUploadDetails.failedImageList.length)
        }

        // Log detailed info for debugging
        if (process.env.DEBUG) {
            console.log('Response details:', {
                imageCount: body?.dataUploadDetails?.imageUploadTotal,
                siteDataUrl: body?.dataUploadDetails?.siteDataUrl,
                failedImages: body?.dataUploadDetails?.failedImageList?.length,
            })
        }

        done()
    } catch (error) {
        console.error('Error processing response:', error)
        done(error)
    }
}

module.exports = {
    validateScrapeResponse,
}
