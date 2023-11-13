import { CreateSiteParams } from '../../types.js'
import { addFileS3, getFileS3 } from '../s3Functions.js'

//add created site params to list in s3
export const addToSiteList = async (websiteData: CreateSiteParams) => {
    const basePath = websiteData.subdomain
    websiteData.domains = []
    const currentSiteList: CreateSiteParams[] = await getFileS3(`sites/site-list.json`, [])
    console.log('current site list', currentSiteList)

    if (currentSiteList.filter((site) => site.subdomain === basePath).length <= 0) {
        currentSiteList.push(websiteData)
        console.log('new site list', currentSiteList)
    }

    await addFileS3(currentSiteList, `sites/site-list`)
}

//modify site array to add published domains
const modifySitesArr = async (subdomain: string, currentSiteList: CreateSiteParams[], currentSiteItemData: CreateSiteParams, domainName: string) => {
    currentSiteItemData.domains?.push(domainName)

    //create array with all but current site working on
    const newSitesArr = currentSiteList.filter((site) => site.subdomain != subdomain)
    //push updated site with the others
    newSitesArr.push(currentSiteItemData)
    console.log('new list', newSitesArr)

    await addFileS3(newSitesArr, `sites/site-list`)
}

//publish site domain
export const publishSite = async (subdomain: string) => {
    const currentSiteList: CreateSiteParams[] = await getFileS3(`sites/site-list.json`, [])
    console.log('current site list', currentSiteList)
    console.log('subdom', subdomain)

    //check site-list for client ID and update published field
    const arrWithClientId = currentSiteList.filter((site) => site.subdomain === subdomain)

    //check if client ID exists already in create-site, then check if site has been published
    if (arrWithClientId.length > 0) {
        const currentSiteItemData = arrWithClientId[0]
        const domainName = currentSiteItemData.subdomain + '.vercel.app'
        if (currentSiteItemData.domains && currentSiteItemData.domains.filter((domain) => domain === domainName).length <= 0) {
            await modifySitesArr(subdomain, currentSiteList, currentSiteItemData, domainName)
            console.log('here is the domain: ', domainName)

            //Add domain to vercel via vercel api
            try {
                const rawResponse = await fetch(
                    `https://api.vercel.com/v10/projects/${process.env.VERCEL_PROJECT_ID}/domains?teamId=${process.env.NEXT_PUBLIC_VERCEL_TEAM_ID}`,
                    {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${process.env.NEXT_PUBLIC_VERCEL_AUTH_TOKEN}`,
                        },
                        body: JSON.stringify({
                            name: domainName,
                        }),
                    }
                )
                console.log('Domain addition success')
            } catch (err) {
                console.log('Domain addition error: ', err)
            }
        } else {
            return 'Domain has already been published'
        }
    } else {
        return 'Client id not found in list of created sites'
    }
    return 'site published'
}
