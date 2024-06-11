import type { CreateSiteParams, DomainRes, Layout } from '../../types.js'
import { SiteDeploymentError } from '../errors.js'
import { addFileS3, getFileS3 } from '../s3Functions.js'
import { sql } from '@vercel/postgres'

const publishDomain = async (method: string, siteLayout: any, domainName: string, subdomain: string) => {
    //add domains to layout file or removes if deleting
    if (method === 'POST') {
        siteLayout.publishedDomains ? siteLayout.publishedDomains.push(domainName) : (siteLayout.publishedDomains = [domainName])
        console.log('published domains', siteLayout.publishedDomains)
    } else if (method === 'DELETE') {
        //remove site from list if deleting
        siteLayout.publishedDomains = siteLayout.publishedDomains?.filter((domain: string) => domain != domainName)
    }
    await addFileS3(siteLayout, `${subdomain}/layout`)
}

//verify domain has been added to project
const verifyDomain = async (domainName: string) => {
    //const vercelApiUrl = `https://api.vercel.com/v10/projects/${process.env.VERCEL_PROJECT_ID}/domains/${domainName}?teamId=${process.env.NEXT_PUBLIC_VERCEL_TEAM_ID}`

    /*  try {
        const fetchDomainData = async () => {
            const response = await fetch(vercelApiUrl, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_VERCEL_AUTH_TOKEN}`,
                },
            })
            return response.json()
        }
*/

    const vercelApiUrl = `https://${domainName}`

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

//takes a site domain and either adds it to vercel or removes it depending on method (POST or DELETE)
export const modifyVercelDomainPublishStatus = async (subdomain: string, method: 'POST' | 'DELETE' = 'POST'): Promise<DomainRes> => {
    /*     const currentSiteList: CreateSiteParams[] = await getFileS3(`sites/site-list.json`, [])
    console.log('current site list', currentSiteList) */

    try {
        const siteLayout: Layout = await getFileS3(`${subdomain}/layout.json`, 'site not found in s3')
        let domainName = subdomain + '.vercel.app'
        let altDomain = subdomain + '-lp' + '' + '.vercel.app'

        if (typeof siteLayout != 'string') {
            //new check with layout file
            let publishedDomains = siteLayout.publishedDomains ? siteLayout.publishedDomains : []
            const isDomainPublishedAlready = publishedDomains.filter((domain) => domain === domainName).length
            const isAltDomainPublishedAlready = publishedDomains.filter((domain) => domain === altDomain).length
            console.log('is pub already', isDomainPublishedAlready)

            if (method === 'POST' ? !isDomainPublishedAlready && !isAltDomainPublishedAlready : isDomainPublishedAlready) {
                console.log('domain: ', domainName)

                //vercep api url changes between post vs delete
                const vercelApiUrl =
                    method === 'POST'
                        ? `https://api.vercel.com/v10/projects/${process.env.VERCEL_PROJECT_ID}/domains?teamId=${process.env.NEXT_PUBLIC_VERCEL_TEAM_ID}`
                        : method === 'DELETE'
                        ? `https://api.vercel.com/v10/projects/${process.env.VERCEL_PROJECT_ID}/domains/${domainName}?teamId=${process.env.NEXT_PUBLIC_VERCEL_TEAM_ID}`
                        : ''

                //Add or remove domain to vercel via vercel api
                try {
                    const response = await fetch(vercelApiUrl, {
                        method: method,
                        headers: {
                            Authorization: `Bearer ${process.env.NEXT_PUBLIC_VERCEL_AUTH_TOKEN}`,
                        },
                        body: JSON.stringify({
                            name: domainName,
                        }),
                    })

                    console.log('vercel domain response', response)

                    //if domain name already exists try adding again with postfix
                    if (response.status === 409) {
                        console.log('domain already exists, adding -lp postfix')
                        const secondDomainAttempt = await fetch(vercelApiUrl, {
                            method: method,
                            headers: {
                                Authorization: `Bearer ${process.env.NEXT_PUBLIC_VERCEL_AUTH_TOKEN}`,
                            },
                            body: JSON.stringify({
                                name: subdomain + '-lp' + '.vercel.app',
                            }),
                        })
                        if (secondDomainAttempt.status === 409) {
                            //throw new Error('Unable to create domain, both versions taken')
                            return {
                                message: `domain "${domainName}" and altered domain "${subdomain}-lp.vercel.app" both already taken in another project`,
                                domain: domainName,
                                status: 'Error',
                            }
                        } else {
                            domainName = subdomain + '-lp' + '.vercel.app'
                            await publishDomain(method, siteLayout, domainName, subdomain)
                            if (await verifyDomain(domainName)) {
                                return {
                                    message: `domain added with postfix -lp because other domain is taken`,
                                    domain: domainName,
                                    status: 'Success',
                                }
                            } else {
                                throw new SiteDeploymentError('Unable to verify domain has been published')
                            }
                        }
                    } else {
                        await publishDomain(method, siteLayout, domainName, subdomain)
                    }
                } catch (err) {
                    // throw new Error('Domain task error: ')
                    return {
                        message: err.message,
                        domain: domainName,
                        status: 'Error',
                    }
                }
            } else {
                return {
                    message:
                        method === 'POST' ? 'domain already published, updating site data' : 'domain cannot be removed as it is not connected to the apexID',
                    domain: publishedDomains[0],
                    status: 'Success',
                }
            }
        } else {
            return {
                message: `ApexID ${subdomain} not found in list of created sites`,
                domain: domainName,
                status: 'Error',
            }
        }
        if (await verifyDomain(domainName)) {
            return { message: `site domain ${method === 'POST' ? 'published' : 'unpublished'}`, domain: domainName, status: 'Success' }
        } else {
            throw new SiteDeploymentError('Unable to verify domain has been published')
        }
    } catch (err) {
        throw new SiteDeploymentError(err.message)
    }
}

export const changePublishStatusInSiteData = async (subdomain: string, status: boolean) => {
    let siteLayoutFile = await getFileS3(`${subdomain}/layout.json`, 'site not found in s3')
    if (typeof siteLayoutFile != 'string') {
        siteLayoutFile.published = status
        await addFileS3(siteLayoutFile, `${subdomain}/layout`)
        return `Domain: ${subdomain} publish status changed`
    } else {
        return `Error: ${subdomain} not found in s3`
    }
}

//add created site params to list in s3
//may not be needed later if we can check s3 for folder
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

//modify site array to add published publishedDomains or remove unpublished domains
/* const modifySitePublishedDomainsList = async (
    subdomain: string,
    currentSiteList: CreateSiteParams[],
    currentSiteData: CreateSiteParams,
    domainName: string,
    method: 'POST' | 'DELETE'
) => {
    let newSiteData = currentSiteData
    if (method === 'POST') {
        newSiteData.publishedDomains?.push(domainName)
    } else if (method === 'DELETE') {
        newSiteData.publishedDomains = currentSiteData.publishedDomains.filter((domain) => domain != domainName)
    }

    //create array with all but current site working on
    const newSitesArr = currentSiteList.filter((site) => site.subdomain != subdomain)
    //push updated site with the others
    newSitesArr.push(newSiteData)
    console.log('new list', newSitesArr)

    await addFileS3(newSitesArr, `sites/site-list`)
} 

//select current site data from site-list using subdomain or id
export const getSiteObjectFromS3 = async (subdomain: string, currentSiteList: CreateSiteParams[], searchBy = 'subdomain', id = '') => {
    const arrWithSiteObject =
        searchBy === 'subdomain' ? currentSiteList.filter((site) => site.subdomain === subdomain) : currentSiteList.filter((site) => site.id === id)

    if (arrWithSiteObject.length > 0) {
        const currentSiteData = arrWithSiteObject[0]
        return currentSiteData
    } else {
        return `${searchBy === 'subdomain' ? 'subdomain' : 'id'} does not match any created sites`
    }
}
*/
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
