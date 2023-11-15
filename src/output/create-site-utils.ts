import { CreateSiteParams } from '../../types.js'
import { addFileS3, getFileS3 } from '../s3Functions.js'

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
        return `Site added to list, ClientId: ${websiteData.clientId}, Subdomain: ${websiteData.subdomain}`
    } else {
        return `Site has already been created, ClientId: ${websiteData.clientId}, Subdomain: ${websiteData.subdomain}`
    }
}

//modify site array to add published publishedDomains or remove unpublished domains
const modifySiteDomainList = async (
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

//select current site data from site-list
const getSiteObjectFromSubdomain = async (subdomain: string, currentSiteList: CreateSiteParams[]) => {
    const arrWithSiteObject = currentSiteList.filter((site) => site.subdomain === subdomain)

    if (arrWithSiteObject.length > 0) {
        const currentSiteData = arrWithSiteObject[0]
        return currentSiteData
    } else {
        return 'subdomain does not match any created sites'
    }
}

//takes a site domain and either adds it to vercel or removes it depending on method (POST or DELETE)
export const modifyVercelDomainPublishStatus = async (subdomain: string, method: 'POST' | 'DELETE' = 'POST') => {
    const currentSiteList: CreateSiteParams[] = await getFileS3(`sites/site-list.json`, [])
    console.log('current site list', currentSiteList)

    const currentSiteData = await getSiteObjectFromSubdomain(subdomain, currentSiteList)
    if (typeof currentSiteData != 'string') {
        const domainName = currentSiteData.subdomain + '.vercel.app'

        //need to check if domain is published already for POST and DELETE methods
        const isDomainPublishedAlready = currentSiteData.publishedDomains.filter((domain) => domain === domainName).length > 0

        if (method === 'POST' ? !isDomainPublishedAlready : isDomainPublishedAlready) {
            await modifySiteDomainList(subdomain, currentSiteList, currentSiteData, domainName, method)
            console.log('here is the domain: ', domainName)

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
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_VERCEL_AUTH_TOKEN}`,
                    },
                    body: JSON.stringify({
                        name: domainName,
                    }),
                })
            } catch (err) {
                console.log('Domain task error: ', err)
            }
        } else {
            return `Domain is not ready for ${method} in site-list`
        }
    } else {
        return 'Subdomain not found in list of created sites'
    }
    return `site domain${method === 'POST' ? 'published' : 'unpublished'}`
}
