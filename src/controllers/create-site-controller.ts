import type { Layout } from '../../types.js'
import { addFileS3, getFileS3 } from '../utilities/s3Functions.js'
import { sql } from '@vercel/postgres'
import { convertUrlToApexId } from '../utilities/utils.js'
import { ApexPageType, PageListType } from '../schema/output-zod.js'
import { SiteDeploymentError } from '../utilities/errors.js'

export const getPageLayoutVars = async (apexID: string, pageUri: string) => {
    const landingPage: ApexPageType = await getFileS3(`${apexID}/pages/${pageUri}.json`, 'site not found in s3')
    if (landingPage.siteLayout) {
        return landingPage.siteLayout
    } else {
        const siteLayout: Layout = await getFileS3(`${apexID}/layout.json`, 'site not found in s3')
        if (typeof siteLayout != 'string') {
            return siteLayout
        } else {
            return 'site not found in s3'
        }
    }
}

//check page list to see if alternate page has same domain
export const checkPageListForDeployements = async (apexID: string, pageUri: string, domainName: string) => {
    const pageListFile: PageListType = await getFileS3(`${apexID}/pages/page-list.json`, 'not found')

    if (typeof pageListFile != 'string') {
        for (let i = 0; i < pageListFile.pages.length; i++) {
            if (!(pageListFile.pages[i].slug === pageUri)) {
                console.log('we have found an alt page')

                //check that domain is the same?
                const altPageFile = await getFileS3(`${apexID}/pages/${pageListFile.pages[i].slug}.json`, 'not found')
                const isPubbedDomainTheSame = altPageFile.publishedDomains.filter((pubDomain: string) => pubDomain === domainName)

                if (isPubbedDomainTheSame.length > 1) {
                    return true
                }
            }
        }
    }
    console.log('alt page does not contain same domain', domainName)

    return false
}

export const createRedirectFile = async (domainName: string, apexID: string, pageUri: string) => {
    if (convertUrlToApexId(domainName) != apexID) {
        console.log('creating redirect file for: ', domainName)
        const redirectFile = {
            apexId: apexID,
            pageUri: pageUri,
        }

        await addFileS3(redirectFile, `${convertUrlToApexId(domainName)}/redirect`)
    }
}

export const changePublishStatusInSiteData = async (subdomain: string, status: boolean, pageUri: string) => {
    const siteLayoutFile = await getPageLayoutVars(subdomain, pageUri)

    if (typeof siteLayoutFile != 'string') {
        siteLayoutFile.published = status
        await addFileS3(siteLayoutFile, `${subdomain}/layout`)
        return `Domain: ${subdomain} publish status changed`
    } else {
        return `Error: ${subdomain} not found in s3`
    }
}

export const getDomainList = async () => {
    const domainList = await getFileS3(`sites/domains.json`, [])

    return domainList
}

export async function checkIfSiteExistsPostgres(domain: string) {
    try {
        const domainCheck = await sql`SELECT * FROM Domains WHERE domain = ${domain};`
        const domainExists = domainCheck.rowCount > 0 ? true : false
        const foundStatus = domainExists === true ? 'site exists' : 'not found'
        console.log(foundStatus)

        return foundStatus
    } catch (error) {
        console.log(error)
        throw { 'this is error': { error } }
    }
}

export const getPageandLanding = async (apexID: string, pageUri: string, type: string) => {
    let siteLayout
    let sitePage
    if (type === 'landing' && pageUri) {
        const landingPage: ApexPageType = await getFileS3(`${apexID}/pages/${pageUri}.json`, 'site not found in s3')
        sitePage = landingPage
        siteLayout = sitePage.siteLayout
    } else {
        siteLayout = await getPageLayoutVars(apexID, pageUri)
    }

    return { siteLayout: siteLayout, sitePage: sitePage }
}

export const getPageList = async (apexID: string) => {
    const pageList: PageListType = await getFileS3(`${apexID}/pages/page-list.json`, 'no page list')

    //check that page list exists
    if (typeof pageList === 'string') {
        throw new SiteDeploymentError({
            message: `ApexID ${apexID} not found in list of client site files`,
            domain: apexID,
            errorType: 'AMS-006',
            state: {
                domainStatus: 'ApexID not found, project not removed',
            },
        })
    }
    return pageList
}
