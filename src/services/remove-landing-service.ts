import type { Layout } from '../../types.js'
import { RemoveLandingPageReq, RemoveLandingPageSchema, RemoveLandingProjectReq, RemoveLandingProjectSchema } from '../schema/input-zod.js'
import { PageListType } from '../schema/output-zod.js'
import { zodDataParse } from '../schema/utils-zod.js'
import { SiteDeploymentError } from '../utilities/errors.js'
import { addFileS3, deleteFileS3, deleteFolderS3, getFileS3 } from '../utilities/s3Functions.js'
import { convertUrlToApexId, getPageNameFromDomain } from '../utilities/utils.js'
import { getPageLayoutVars, getPageList } from './create-site-service.js'
import { removeDomainFromVercel } from './domain-service.js'

export const removeLandingProject = async (req: RemoveLandingProjectReq) => {
    const parsedReq = zodDataParse(req, RemoveLandingProjectSchema)
    const apexID = parsedReq.apexID
    const oldPageList = await getPageList(apexID)

    //need page-list to delete each one
    for (let i = 0; i < oldPageList.pages.length; i++) {
        const pageName = oldPageList.pages[i].slug
        const siteLayout = await getPageLayoutVars(apexID, pageName)
        console.log('pagename', pageName)

        if (typeof siteLayout != 'string') {
            console.log('we have layout for both')
            const domains = siteLayout.publishedDomains

            for (let i = domains.length - 1; i >= 0; i--) {
                console.log('removing domain: ', domains[i], pageName)
                await removeDomainAndS3(domains[i], pageName)
            }
        } else {
            throw new SiteDeploymentError({
                message: `ApexID ${apexID} not found in list of client site files`,
                domain: apexID,
                errorType: 'AMS-006',
                state: {
                    domainStatus: 'ApexID not found, project not removed',
                },
            })
        }
    }
    return {
        message: 'apexID removed sucessfully',
        apexID: apexID,
        status: 'Success',
    }
}

export const removeLandingSite = async (req: RemoveLandingPageReq) => {
    const parsedReq = zodDataParse(req, RemoveLandingPageSchema)
    const domain = parsedReq.domain
    const pageUri = getPageNameFromDomain(domain)
    return removeDomainAndS3(domain, pageUri)
}

export const removeDomainAndS3 = async (domain: string, pageUri = '') => {
    const apexID = convertUrlToApexId(domain, false)
    const domainNoPage = domain.replace(`/${pageUri}`, '')
    const response = await removeDomainFromVercel(domainNoPage, pageUri)
    await removeSiteFromS3(apexID, pageUri)
    return response
}

export const removeSiteFromS3 = async (apexID: string, pageUri: string) => {
    const siteLayout = await getPageLayoutVars(apexID, pageUri)

    if (typeof siteLayout != 'string') {
        //only delete s3 folder if there are no corresponding alt domains
        if (siteLayout.publishedDomains.length < 1) {
            await removeLandingPage(apexID, pageUri)
        } else {
            console.log('not deleting s3 file due to other alternate domains existing')
        }
    } else {
        //check if redirect file
        const redirectFile: { apexId: string } = await getFileS3(`${apexID}/redirect.json`, 'site not found in s3')
        if (typeof redirectFile != 'string') {
            await deleteFolderS3(apexID) //delete redirect s3 folder

            //if the original s3 folder after redirect is empty of domains delete it
            const originalSiteLayout = await getPageLayoutVars(redirectFile.apexId, pageUri)
            if (typeof originalSiteLayout != 'string' && originalSiteLayout.publishedDomains.length < 1) {
                await removeLandingPage(redirectFile.apexId, pageUri)
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

// add a function that deletes file then if page-list is empty deletes that
export const removeLandingPage = async (apexID: string, pageSlug: string) => {
    await deleteFileS3(`${apexID}/pages/${pageSlug}.json`) //delete page

    //get pagelist
    const oldPageList: PageListType = await getFileS3(`${apexID}/pages/page-list.json`)
    const newPageList: PageListType = { pages: [] }

    for (let i = 0; i < oldPageList.pages.length; i++) {
        if (!(oldPageList.pages[i].slug === pageSlug)) {
            newPageList.pages.push(oldPageList.pages[i])
        }
    }

    if (newPageList.pages.length <= 0) {
        console.log('page-list file now empty')
        await deleteFileS3(`${apexID}/pages/page-list.json`)
    } else {
        await addFileS3(newPageList, `${apexID}/pages/page-list`)
    }
    return
}
