import { LandingReq } from '../../schema/input-zod'
import { createLayoutFile, createPageFile } from '../controllers/landing-controller'
import { TransformError } from '../errors'

export const createLandingPageFiles = async (siteData: LandingReq, apexID: string) => {
    try {
        const layoutContents = await createLayoutFile(siteData, apexID)
        const page = createPageFile(siteData)
        let siteID = layoutContents.siteIdentifier
        console.log('Successfully created site files:', { siteLayout: layoutContents.siteLayout, siteIdentifier: siteID, pages: [page] })
        return { siteLayout: layoutContents.siteLayout, siteIdentifier: siteID, pages: [page] }
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
