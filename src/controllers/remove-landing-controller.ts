import type { Layout } from '../../types'
import { RemoveLandingPageReq, RemoveLandingPageSchema } from '../schema/input-zod'
import { zodDataParse } from '../schema/utils-zod'
import { SiteDeploymentError } from '../utilities/errors.js'
import { deleteFileS3, deleteFolderS3, getFileS3 } from '../utilities/s3Functions.js'
import { convertUrlToApexId } from '../utilities/utils'
import { removeDomainFromVercel } from './create-site-controller'

export const removeLandingSite = async (req: RemoveLandingPageReq) => {
    const parsedReq = zodDataParse(req, RemoveLandingPageSchema)
    const url = parsedReq.url

    const apexID = convertUrlToApexId(url, false)
    const response = await removeDomainFromVercel(url)
    await removeSiteFromS3(apexID)

    return response
}

const removeSiteFromS3 = async (apexID: string) => {
    const siteLayout: Layout = await getFileS3(`${apexID}/layout.json`, 'site not found in s3')
    console.log('apexid1', apexID)
    if (typeof siteLayout != 'string') {
        await deleteFolderS3(apexID)
    } else {
        throw new SiteDeploymentError({
            message: `ApexID ${apexID} not found in list of created sites`,
            domain: apexID,
            errorType: 'AMS-006',
            state: {
                domainStatus: 'ApexID not found in list',
            },
        })
    }
}
