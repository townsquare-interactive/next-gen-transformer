import type { CreateSiteParams, Dns, DomainOptions, DomainRes, Layout } from '../../types.js'
import { SiteDeploymentError } from '../utilities/errors.js'
import { addFileS3, getFileS3 } from '../utilities/s3Functions.js'
import { sql } from '@vercel/postgres'
import { checkApexIDInDomain, convertUrlToApexId, createRandomFiveCharString } from '../utilities/utils.js'
import { ApexPageType, PageListType } from '../schema/output-zod.js'
import { String } from 'aws-sdk/clients/apigateway.js'

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

//lets check page-list here
export const checkPageListForDeployements = async (apexID: string, pageUri: string, domainName: string) => {
    const pageListFile: PageListType = await getFileS3(`${apexID}/pages/page-list.json`, 'not found')

    if (typeof pageListFile != 'string') {
        for (let i = 0; i < pageListFile.pages.length; i++) {
            if (!(pageListFile.pages[i].slug === pageUri)) {
                console.log('we have found an alt page')
                return true
            }
        }
    }
    console.log('no alt page found')
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
        console.log('slayout', siteLayout)
    } else {
        siteLayout = await getPageLayoutVars(apexID, pageUri)
    }

    return { siteLayout: siteLayout, sitePage: sitePage }
}
