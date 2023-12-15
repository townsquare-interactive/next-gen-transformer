import { CreateSiteParams, Layout } from '../../types.js'
import { addFileS3, getFileS3 } from '../s3Functions.js'

//takes a site domain and either adds it to vercel or removes it depending on method (POST or DELETE)
export const modifyVercelDomainPublishStatus = async (subdomain: string, method: 'POST' | 'DELETE' = 'POST') => {
    const currentSiteList: CreateSiteParams[] = await getFileS3(`sites/site-list.json`, [])
    console.log('current site list', currentSiteList)

    let siteLayout: Layout = await getFileS3(`${subdomain}/layout.json`, 'site not found in s3')

    if (typeof siteLayout != 'string') {
        const domainName = subdomain + '.vercel.app'

        //new check with layout file
        let publishedDomains = siteLayout.publishedDomains ? siteLayout.publishedDomains : []
        const isDomainPublishedAlready = publishedDomains.filter((domain) => domain === domainName).length

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
            } catch (err) {
                console.log('Domain task error: ', err)
            }
        } else {
            return `Domain is not ready for ${method} in layout file`
        }
    } else {
        return 'Subdomain not found in list of created sites'
    }
    return `site domain ${method === 'POST' ? 'published' : 'unpublished'}`
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
    websiteData.id = (currentSiteList.length + 1).toString()
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
