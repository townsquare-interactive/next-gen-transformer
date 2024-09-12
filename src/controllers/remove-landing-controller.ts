import type { Layout } from '../../types'
import { RemoveLandingPageReq, RemoveLandingPageSchema } from '../schema/input-zod.js'
import { zodDataParse } from '../schema/utils-zod.js'
import { SiteDeploymentError } from '../utilities/errors.js'
import { deleteFolderS3, getFileS3 } from '../utilities/s3Functions.js'
import { convertUrlToApexId } from '../utilities/utils.js'
import { removeDomainFromVercel } from './create-site-controller.js'

export const removeLandingSite = async (req: RemoveLandingPageReq) => {
    const parsedReq = zodDataParse(req, RemoveLandingPageSchema)
    const url = parsedReq.url
    const apexID = convertUrlToApexId(url, false)
    const response = await removeDomainFromVercel(url)
    await removeSiteFromS3(apexID)

    return response
}

export const removeSiteFromS3 = async (apexID: string) => {
    const siteLayout: Layout = await getFileS3(`${apexID}/layout.json`, 'site not found in s3')
    console.log('apexid1', apexID)
    if (typeof siteLayout != 'string') {
        //only delete s3 folder if there are no corresponding alt domains
        if (siteLayout.publishedDomains.length <= 1) {
            await deleteFolderS3(apexID)
        } else {
            console.log('not deleting s3 folder due to other alternate domains existing')
        }
    } else {
        //check if redirect file
        const redirectFile: { apexId: string } = await getFileS3(`${apexID}/redirect.json`, 'site not found in s3')
        if (typeof redirectFile != 'string') {
            await deleteFolderS3(apexID) //delete redirect s3 folder

            //if the original s3 folder after redirect is empty of domains delete it
            const originalApexFolder: Layout = await getFileS3(`${redirectFile.apexId}/layout.json`, 'site not found in s3')
            if (typeof originalApexFolder != 'string' && originalApexFolder.publishedDomains.length < 1) {
                await deleteFolderS3(redirectFile.apexId)
            }
        } else {
            throw new SiteDeploymentError({
                message: `ApexID ${apexID} not found in list of created sites during S3 deletion`,
                domain: apexID,
                errorType: 'AMS-006',
                state: {
                    domainStatus: 'ApexID not found in list',
                },
            })
        }
    }
}
