import { SiteDeploymentError } from '../errors.js'
import { addFileS3, getFileS3 } from '../s3Functions.js'
import { sql } from '@vercel/postgres'
const publishDomain = async (method, siteLayout, domainName, subdomain) => {
    //add domains to layout file or removes if deleting
    if (method === 'POST') {
        siteLayout.publishedDomains ? siteLayout.publishedDomains.push(domainName) : (siteLayout.publishedDomains = [domainName])
        console.log('published domains', siteLayout.publishedDomains)
    } else if (method === 'DELETE') {
        //remove site from list if deleting
        siteLayout.publishedDomains = siteLayout.publishedDomains?.filter((domain) => domain != domainName)
    }
    await addFileS3(siteLayout, `${subdomain}/layout`)
}
//verify domain has been added to project
const verifyDomain = async (domainName) => {
    //const vercelApiUrl = `https://api.vercel.com/v10/projects/${process.env.VERCEL_PROJECT_ID}/domains/${domainName}?teamId=${process.env.NEXT_PUBLIC_VERCEL_TEAM_ID}`
    const vercelApiUrl = `https://${domainName}`
    const fetchDomainData = async (url, retries = 3, delayMs = 1400) => {
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
export const modifyVercelDomainPublishStatus = async (subdomain, method = 'POST') => {
    /*     const currentSiteList: CreateSiteParams[] = await getFileS3(`sites/site-list.json`, [])
    console.log('current site list', currentSiteList) */
    try {
        const siteLayout = await getFileS3(`${subdomain}/layout.json`, 'site not found in s3')
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
                            throw new SiteDeploymentError({
                                message: `domain "${domainName}" and altered domain "${subdomain}-lp.vercel.app" both already taken in another project`,
                                domain: domainName,
                                errorID: 'DMN-001',
                            })
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
                                throw new SiteDeploymentError({
                                    message: 'Unable to verify domain has been published',
                                    domain: domainName,
                                    errorID: 'DMN-002',
                                })
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
            throw new SiteDeploymentError({
                message: 'Unable to verify domain has been published',
                domain: domainName,
                errorID: 'DMN-002',
            })
        }
    } catch (err) {
        throw new SiteDeploymentError({
            message: err.message,
            domain: '',
            errorID: 'GEN-003',
        })
    }
}
export const changePublishStatusInSiteData = async (subdomain, status) => {
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
export const addToSiteList = async (websiteData) => {
    const basePath = websiteData.subdomain
    websiteData.publishedDomains = []
    const currentSiteList = await getFileS3(`sites/site-list.json`, [])
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
export async function checkIfSiteExistsPostgres(domain) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLXNpdGUtY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb250cm9sbGVycy9jcmVhdGUtc2l0ZS1jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLGNBQWMsQ0FBQTtBQUNsRCxPQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxNQUFNLG1CQUFtQixDQUFBO0FBQ3hELE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQTtBQUV0QyxNQUFNLGFBQWEsR0FBRyxLQUFLLEVBQUUsTUFBYyxFQUFFLFVBQWUsRUFBRSxVQUFrQixFQUFFLFNBQWlCLEVBQUUsRUFBRTtJQUNuRyxtREFBbUQ7SUFDbkQsSUFBSSxNQUFNLEtBQUssTUFBTSxFQUFFLENBQUM7UUFDcEIsVUFBVSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUE7UUFDekgsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxVQUFVLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtJQUNqRSxDQUFDO1NBQU0sSUFBSSxNQUFNLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDN0IsbUNBQW1DO1FBQ25DLFVBQVUsQ0FBQyxnQkFBZ0IsR0FBRyxVQUFVLENBQUMsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDLENBQUMsTUFBYyxFQUFFLEVBQUUsQ0FBQyxNQUFNLElBQUksVUFBVSxDQUFDLENBQUE7SUFDL0csQ0FBQztJQUNELE1BQU0sU0FBUyxDQUFDLFVBQVUsRUFBRSxHQUFHLFNBQVMsU0FBUyxDQUFDLENBQUE7QUFDdEQsQ0FBQyxDQUFBO0FBRUQseUNBQXlDO0FBQ3pDLE1B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
