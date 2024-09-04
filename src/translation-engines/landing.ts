import type { LandingReq } from '../schema/input-zod.js'
import { createLayoutFile, createPageFile } from '../controllers/landing-controller.js'
import { TransformError } from '../utilities/errors.js'

export const createLandingPageFiles = async (siteData: LandingReq, apexID: string) => {
    try {
        const { siteLayout, siteIdentifier } = await createLayoutFile(siteData, apexID)
        const page = createPageFile(siteData, siteLayout)
        let siteID = siteIdentifier
        console.log('Successfully created site files:', { siteLayout: siteLayout, siteIdentifier: siteID, pages: [page] })
        return { siteLayout: siteLayout, siteIdentifier: siteID, pages: [page] }
    } catch (err) {
        console.error('Caught error in createLandingPageFiles:', err)
        throw new TransformError({
            message: err.message,
            errorType: 'GEN-003',
            state: {
                siteStatus: 'Process stopped when creating site files',
            },
        })
    }
}
