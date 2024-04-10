import { CreateSiteParams, Layout } from '../../types.js'
import { addFileS3, getFileS3 } from '../s3Functions.js'
import { sql } from '@vercel/postgres'

//takes a site domain and either adds it to vercel or removes it depending on method (POST or DELETE)
export const modifyVercelDomainPublishStatus = async (subdomain: string, method: 'POST' | 'DELETE' = 'POST') => {
    /*     const currentSiteList: CreateSiteParams[] = await getFileS3(`sites/site-list.json`, [])
    console.log('current site list', currentSiteList) */

    const siteLayout: Layout = await getFileS3(`${subdomain}/layout.json`, 'site not found in s3')
    const domainName = subdomain + '.vercel.app'

    if (typeof siteLayout != 'string') {
        //new check with layout file
        let publishedDomains = siteLayout.publishedDomains ? siteLayout.publishedDomains : []
        const isDomainPublishedAlready = publishedDomains.filter((domain) => domain === domainName).length
        console.log('is pub already', isDomainPublishedAlready)

        if (method === 'POST' ? !isDomainPublishedAlready : isDomainPublishedAlready) {
            console.log('here is the domain: ', domainName)

            //add domains to layout file or removes if deleting
            if (method === 'POST') {
                siteLayout.publishedDomains ? siteLayout.publishedDomains.push(domainName) : (siteLayout.publishedDomains = [domainName])
                console.log('published domains', siteLayout.publishedDomains)
            } else if (method === 'DELETE') {
                //remove site from list if deleting
                siteLayout.publishedDomains = siteLayout.publishedDomains?.filter((domain) => domain != domainName)
            }
            await addFileS3(siteLayout, `${subdomain}/layout`)

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
                    /*                     console.log('domain already exists, adding -preview')
                    const secondDomain = await fetch(vercelApiUrl, {
                        method: method,
                        headers: {
                            Authorization: `Bearer ${process.env.NEXT_PUBLIC_VERCEL_AUTH_TOKEN}`,
                        },
                        body: JSON.stringify({
                            name: subdomain + '-preview' + '.vercel.app',
                        }),
                    })
                    if (secondDomain.status === 409) {
                        throw new Error('Unable to create domain, both versions taken')
                    } */
                    return 'domain already live in another project'
                }
            } catch (err) {
                console.log('Domain task error: ', err)
                throw new Error('Domain task error: ')
            }
        } else {
            //return `Domain is not ready for ${method} in layout file`
            return method === 'POST'
                ? `domain ${domainName} already published, updating site data`
                : `domain ${domainName} cannot be removed as it is not connected to the apexID`
        }
    } else {
        return 'Subdomain not found in list of created sites'
    }
    return `site domain ${domainName} ${method === 'POST' ? 'published' : 'unpublished'}`
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
