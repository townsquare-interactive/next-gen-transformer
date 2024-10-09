import type { CreateSiteParams, Dns, DomainOptions, DomainRes, Layout } from '../../types.js'
import { SiteDeploymentError } from '../utilities/errors.js'
import { addFileS3, getFileS3 } from '../utilities/s3Functions.js'
import { sql } from '@vercel/postgres'
import { checkApexIDInDomain, convertUrlToApexId, createRandomFiveCharString } from '../utilities/utils.js'
import { ApexPageType } from '../schema/output-zod.js'
import { String } from 'aws-sdk/clients/apigateway.js'

const previewPostFix = '.vercel.app'

const modifyDomainPublishStatus = async (method: string, siteLayout: any, domainName: string, apexId: string, pathName = `${apexId}/layout`) => {
    //add domains to layout file or removes if deleting
    if (method === 'POST') {
        siteLayout.publishedDomains ? siteLayout.publishedDomains.push(domainName) : (siteLayout.publishedDomains = [domainName])
        console.log('published domains', siteLayout.publishedDomains)
    } else if (method === 'DELETE') {
        //remove site from list if deleting
        siteLayout.publishedDomains = siteLayout.publishedDomains?.filter((domain: string) => domain != domainName)
    }
    await addFileS3(siteLayout, pathName)
}

const modifyLandingDomainPublishStatus = async (method: string, sitePage: ApexPageType, domainName: string, apexId: string, pathName = `${apexId}/layout`) => {
    console.log('premod doms', sitePage.siteLayout)
    //add domains to layout file or removes if deleting
    if (method === 'POST') {
        sitePage.siteLayout.publishedDomains ? sitePage.siteLayout?.publishedDomains.push(domainName) : (sitePage.siteLayout.publishedDomains = [domainName])
        console.log('published domains', sitePage.siteLayout?.publishedDomains)
    } else if (method === 'DELETE') {
        //remove site from list if deleting
        sitePage.siteLayout.publishedDomains = sitePage.siteLayout?.publishedDomains?.filter((domain: string) => domain != domainName)
    }
    console.log('mod doms', sitePage.siteLayout.publishedDomains)
    await addFileS3(sitePage, pathName)
}

//verify domain has been added to project
const verifyDomain = async (domainName: string) => {
    //const vercelApiUrl = `https://api.vercel.com/v10/projects/${process.env.VERCEL_PROJECT_ID}/domains/${domainName}?teamId=${process.env.NEXT_PUBLIC_VERCEL_TEAM_ID}`

    const vercelApiUrl = `https://${domainName}`

    //fetch domain to see if you get a response
    const fetchDomainData = async (url: string, retries = 3, delayMs = 1400) => {
        for (let attempt = 1; attempt <= retries; attempt++) {
            const response = await fetch(url, {
                method: 'GET',
            })

            if (response.status === 200) {
                console.log(`Domain GET request successful on attempt ${attempt}`)
                return true
            }

            //If there are still attempts left delay time and try again
            if (attempt < retries) {
                console.log(`Domain GET attempt ${attempt} failed, retrying after delay...`)
                await new Promise((resolve) => setTimeout(resolve, delayMs))
            } else {
                console.log(`All ${retries} attempts failed`)
                return false
            }
        }
    }

    try {
        const isVerified = await fetchDomainData(vercelApiUrl)
        return isVerified
    } catch (err) {
        throw new SiteDeploymentError(err.message)
    }
}

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

//takes a site domain and either adds it to vercel or removes it depending on method (POST or DELETE)
export const publishDomainToVercel = async (domainOptions: DomainOptions, apexID: string, pageUri = '', type = 'landing'): Promise<DomainRes> => {
    //const siteLayout = await getPageLayoutVars(apexID, pageUri)
    const { siteLayout, sitePage } = await getPageandLanding(apexID, pageUri, type)
    /* let { siteLayout, sitePage } = await getPageandLanding(apexID, pageUri, type)
    if (!siteLayout) {
        siteLayout = await getPageLayoutVars(apexID, pageUri)
    } */

    const postfix = domainOptions.usingPreview ? previewPostFix : ''
    let domainName = domainOptions.domain + postfix
    let randomString = createRandomFiveCharString()
    let randomStringDomain = domainOptions.domain + '-' + randomString
    let altDomain = randomStringDomain + postfix

    //check if s3 folder exists for domain
    if (typeof siteLayout != 'string' && siteLayout) {
        let publishedDomains = siteLayout.publishedDomains ? siteLayout.publishedDomains : []
        const isDomainPublishedAlready = publishedDomains.filter((domain: String) => domain === domainName).length

        //check if a random char generated domain has already been published
        const publishedAltDomain = publishedDomains.filter((domain) => checkApexIDInDomain(domain, domainOptions, postfix))
        if (publishedAltDomain.length) {
            console.log('already an alt domain')
            domainName = publishedAltDomain[0]
        }

        //check if domain has already been published
        if (!isDomainPublishedAlready && !publishedAltDomain.length) {
            console.log('domain: ', domainName)

            //vercep api url changes between post vs delete
            const vercelApiUrl = `https://api.vercel.com/v10/projects/${process.env.VERCEL_PROJECT_ID}/domains?teamId=${process.env.NEXT_PUBLIC_VERCEL_TEAM_ID}`

            //Add or remove domain to vercel via vercel api
            const response = await fetch(vercelApiUrl, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_VERCEL_AUTH_TOKEN}`,
                },
                body: JSON.stringify({
                    name: domainName,
                }),
            })

            console.log('vercel domain response', response)

            //if domain name already exists try adding again with postfix
            let tries = 0
            if (response.status === 409) {
                if (!domainOptions.usingPreview) {
                    throw new SiteDeploymentError({
                        message: `production domain "${domainOptions.domain}" is taken and another domain must be provided`,
                        domain: domainName,
                        errorType: 'DMN-008',
                        state: {
                            domainStatus: 'Domain not added for project',
                        },
                    })
                }

                tries += 1
                console.log(`domain already exists, adding random char postfix try number ${tries}`)

                const secondDomainAttempt = await fetch(vercelApiUrl, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_VERCEL_AUTH_TOKEN}`,
                    },
                    body: JSON.stringify({
                        name: altDomain,
                    }),
                })

                if (secondDomainAttempt.status === 409) {
                    tries += 1
                    console.log(`domain already exists again, adding random char postfix try number ${tries}`)

                    altDomain = domainOptions.domain + '-' + createRandomFiveCharString() + postfix
                    const thirdDomainAttempt = await fetch(vercelApiUrl, {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${process.env.NEXT_PUBLIC_VERCEL_AUTH_TOKEN}`,
                        },
                        body: JSON.stringify({
                            name: altDomain,
                        }),
                    })

                    if (thirdDomainAttempt.status === 409) {
                        throw new SiteDeploymentError({
                            message: `domain "${domainName}" and altered domain "${altDomain}" both already taken in another project`,
                            domain: domainName,
                            errorType: 'DMN-001',
                            state: {
                                domainStatus: 'Domain not added for project',
                            },
                        })
                    }
                }
                domainName = altDomain
                await createRedirectFile(domainName, apexID, pageUri)

                //isDomainConfigCorrect(domainName, domainOptions, apexID, pageUri)
                /* const configData = await checkDomainConfigOnVercel(domainName)
                if (configData.misconfigured) {
                    const newDomainOptions = {
                        ...domainOptions,
                        domain: apexID + previewPostFix,
                        usingPreview:true,
                    }
                    return publishDomainToVercel(newDomainOptions, apexID, pageUri || '')
                } */

                if (await verifyDomain(domainName)) {
                    if (type === 'landing' && sitePage?.siteLayout) {
                        await modifyLandingDomainPublishStatus('POST', sitePage, domainName, apexID, `${apexID}/pages/${pageUri}`)
                    } else {
                        await modifyDomainPublishStatus('POST', siteLayout, domainName, apexID, `${apexID}/layout`)
                    }

                    return {
                        message: `domain added with postfix ${altDomain} because other domain is taken`,
                        domain: domainName,
                        status: 'Success',
                    }
                } else {
                    throw new SiteDeploymentError({
                        message: 'Unable to verify domain has been published',
                        domain: domainName,
                        errorType: 'DMN-002',
                        state: {
                            domainStatus: 'Domain not added for project',
                        },
                    })
                }
            } else {
                if (type === 'landing' && sitePage?.siteLayout) {
                    await modifyLandingDomainPublishStatus('POST', sitePage, domainName, apexID, `${apexID}/pages/${pageUri}`)
                } else {
                    await modifyDomainPublishStatus('POST', siteLayout, domainName, apexID, `${apexID}/layout`)
                }
            }
        } else {
            //check config to see if prod domain is set up correctly
            if (!domainName.includes(previewPostFix) && !domainOptions.usingPreview) {
                const configData = await checkDomainConfigOnVercel(domainName)
                const publishedPreviewDomains = publishedDomains.filter((domain) => domain.includes(previewPostFix))
                const previewDomain = publishedPreviewDomains[0]

                //check if the domain being used is configured yet?
                if (configData.misconfigured) {
                    const previewDomainWithSlug = previewDomain + (pageUri ? `/${pageUri}` : '')
                    return {
                        message: `production domain ${domainName} is still not configured, here is the preview domain ${previewDomainWithSlug}`,
                        domain: previewDomainWithSlug,
                        status: 'Success',
                    }
                }
            }

            //Set message to note previous attempt if relevant
            const message = domainOptions.previousAttempt
                ? `Original domain ${domainOptions.previousAttempt} has been added but the domain configuration is not set up. Adding a preview free domain to use in the meantime`
                : 'domain already published, updating site data'

            return {
                message: message,
                domain: `${domainName + (pageUri ? `/${pageUri}` : '')}`,
                status: 'Success',
            }
        }
    } else {
        throw new SiteDeploymentError({
            message: `ApexID ${apexID} not found in list of created sites`,
            domain: domainName,
            errorType: 'AMS-006',
            state: {
                domainStatus: 'Domain not added for project',
            },
        })
    }
    await createRedirectFile(domainName, apexID, pageUri)

    //check domain configuration status
    const configData = await checkDomainConfigOnVercel(domainName)
    if (configData.misconfigured) {
        const newDomainOptions = {
            domain: apexID,
            usingPreview: true,
            previousAttempt: domainName,
        }
        return publishDomainToVercel(newDomainOptions, apexID, pageUri || '')
    }

    //verify the domain is live
    if (await verifyDomain(domainName)) {
        //if a previous domain was added with a misconfigured config then return a preview URL
        if (domainOptions.previousAttempt) {
            return {
                message: `Original domain ${domainOptions.previousAttempt} has been added but the domain configuration is not set up. Adding a preview free domain to use in the meantime`,
                domain: `${domainName + (pageUri ? `/${pageUri}` : '')}`,
                status: 'Success',
            }
        }

        return { message: `site domain published'`, domain: `${domainName + (pageUri ? `/${pageUri}` : '')}`, status: 'Success' }
    } else {
        throw new SiteDeploymentError({
            message: 'Unable to verify domain has been published',
            domain: domainName,
            errorType: 'DMN-002',
            state: {
                domainStatus: 'Domain not added for project',
            },
        })
    }
}

const createRedirectFile = async (domainName: string, apexID: string, pageUri: string) => {
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

//add created site params to list in s3
export const addToSiteList = async (websiteData: CreateSiteParams) => {
    const basePath = websiteData.subdomain
    websiteData.publishedDomains = []
    const currentSiteList: CreateSiteParams[] = await getFileS3(`sites/site-list.json`, [])
    console.log('current site list', currentSiteList)

    //Add site to s3 site-list if it is not already there
    if (currentSiteList.filter((site) => site.subdomain === basePath).length <= 0) {
        currentSiteList.push(websiteData)
        console.log('new site list', currentSiteList)
        await addFileS3(currentSiteList, `sites/site-list`)
        return `Site added, ClientId: ${websiteData.id}, Subdomain: ${websiteData.subdomain}  `
    } else {
        throw new Error(`Site has already been created, ClientId: ${websiteData.clientId}, Subdomain: ${websiteData.subdomain}  `)
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

export const removeDomainFromVercel = async (domain: string, pageUri = '', type = 'landing'): Promise<DomainRes> => {
    const apexID = convertUrlToApexId(domain, false)

    //check here if redirect file, if so followo breadcrumbs to get to layout
    const redirectFile: string | { apexId: string } = await getFileS3(`${apexID}/redirect.json`, 'no redirect found')

    let finalApexID = apexID

    //if using a redirect file change the apexID to the redirected ID
    if (typeof redirectFile != 'string' && redirectFile.apexId) {
        console.log('redirect file has been found', redirectFile.apexId)
        finalApexID = redirectFile.apexId
    }

    const { siteLayout, sitePage } = await getPageandLanding(finalApexID, pageUri, type)

    let domainName = domain

    if (typeof siteLayout != 'string' && siteLayout) {
        //check that this url is tied with the S3 layout published domains field
        let publishedDomains = siteLayout.publishedDomains ? siteLayout.publishedDomains : []
        const isDomainPublishedAlready = publishedDomains.filter((listedDomain) => listedDomain === domainName).length

        if (isDomainPublishedAlready) {
            console.log('domain: ', domainName)

            //vercep api url changes between post vs delete
            const vercelApiUrl = `https://api.vercel.com/v10/projects/${process.env.VERCEL_PROJECT_ID}/domains/${domainName}?teamId=${process.env.NEXT_PUBLIC_VERCEL_TEAM_ID}`

            //Add or remove domain to vercel via vercel api
            try {
                const response = await fetch(vercelApiUrl, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_VERCEL_AUTH_TOKEN}`,
                    },
                    body: JSON.stringify({
                        name: domainName,
                    }),
                })

                console.log('vercel domain response', response)

                if (type === 'landing' && sitePage?.siteLayout) {
                    await modifyLandingDomainPublishStatus('DELETE', sitePage, domainName, finalApexID, `${finalApexID}/pages/${pageUri}`)
                } else {
                    await modifyDomainPublishStatus('DELETE', siteLayout, domainName, finalApexID, `$finalAapexID}/layout`)
                }
            } catch (err) {
                throw new SiteDeploymentError({
                    message: err.message,
                    domain: domainName,
                    errorType: 'GEN-003',
                    state: {
                        domainStatus: 'Domain unable to be removed from project',
                    },
                })
            }
        } else {
            throw new SiteDeploymentError({
                message: `'domain cannot be removed as it is not connected to the apexID S3 folder`,
                domain: domainName,
                errorType: 'AMS-006',
                state: {
                    domainStatus: 'Domain unable to be removed as it was not found in S3 check',
                },
            })
        }
    } else {
        throw new SiteDeploymentError({
            message: `ApexID ${apexID} not found in list of created sites`,
            domain: domainName,
            errorType: 'AMS-006',
            state: {
                domainStatus: 'Domain unable to be removed as it was not found in S3 check',
            },
        })
    }
    return { message: `site domain unpublished`, domain: domainName, status: 'Success' }
}

const buildDNSRecords = (aValues: string[]): Dns[] => {
    const records = aValues.map((ip) => ({
        type: 'A',
        host: '@',
        value: ip,
        ttl: 3600,
    }))

    return records
}

export const fetchDomainConfig = async (domain: string) => {
    const res = await fetch(`https://api.vercel.com/v6/domains/${domain}/config?strict=true&teamId=${process.env.NEXT_PUBLIC_VERCEL_TEAM_ID}`, {
        headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_VERCEL_AUTH_TOKEN}`,
        },
        method: 'get',
    })

    if (!res.ok) {
        console.error('Error fetching domain config:', res.statusText)
        throw new Error('Error checking domain config')
    }

    const data = await res.json()
    console.log(data)
    return data
}

export const checkDomainConfigOnVercel = async (domain?: string) => {
    try {
        const data = await fetchDomainConfig(domain || '')
        const misconfigured = data.misconfigured
        let dnsRecords

        if (misconfigured) {
            console.log('the domain is not configured')
            dnsRecords = buildDNSRecords(data.aValues)
        }

        return {
            misconfigured: misconfigured,
            dnsRecords: dnsRecords,
            cNames: data.cNames,
            domain: domain,
        }
    } catch (err) {
        throw new SiteDeploymentError({
            message: `Error checking domain config: ${err}`,
            domain: domain || '',
            errorType: 'DMN-009',
            state: {
                domainStatus: 'Unable to check domains config in Vercel',
            },
        })
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
