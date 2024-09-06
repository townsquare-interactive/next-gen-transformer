import { SiteDeploymentError } from '../utilities/errors.js';
import { addFileS3, getFileS3 } from '../utilities/s3Functions.js';
import { sql } from '@vercel/postgres';
import { convertUrlToApexId } from '../utilities/utils.js';
const modifyDomainPublishStatus = async (method, siteLayout, domainName, subdomain) => {
    //add domains to layout file or removes if deleting
    if (method === 'POST') {
        siteLayout.publishedDomains ? siteLayout.publishedDomains.push(domainName) : (siteLayout.publishedDomains = [domainName]);
        console.log('published domains', siteLayout.publishedDomains);
    }
    else if (method === 'DELETE') {
        //remove site from list if deleting
        siteLayout.publishedDomains = siteLayout.publishedDomains?.filter((domain) => domain != domainName);
    }
    await addFileS3(siteLayout, `${subdomain}/layout`);
};
//verify domain has been added to project
const verifyDomain = async (domainName) => {
    //const vercelApiUrl = `https://api.vercel.com/v10/projects/${process.env.VERCEL_PROJECT_ID}/domains/${domainName}?teamId=${process.env.NEXT_PUBLIC_VERCEL_TEAM_ID}`
    const vercelApiUrl = `https://${domainName}`;
    //fetch domain to see if you get a response
    const fetchDomainData = async (url, retries = 3, delayMs = 1400) => {
        for (let attempt = 1; attempt <= retries; attempt++) {
            const response = await fetch(url, {
                method: 'GET',
            });
            if (response.status === 200) {
                console.log(`Domain GET request successful on attempt ${attempt}`);
                return true;
            }
            //If there are still attempts left delay time and try again
            if (attempt < retries) {
                console.log(`Domain GET attempt ${attempt} failed, retrying after delay...`);
                await new Promise((resolve) => setTimeout(resolve, delayMs));
            }
            else {
                console.log(`All ${retries} attempts failed`);
                return false;
            }
        }
    };
    try {
        const isVerified = await fetchDomainData(vercelApiUrl);
        return isVerified;
    }
    catch (err) {
        throw new SiteDeploymentError(err.message);
    }
};
//takes a site domain and either adds it to vercel or removes it depending on method (POST or DELETE)
export const publishDomainToVercel = async (subdomain, pageUri = '') => {
    /*     try { */
    const siteLayout = await getFileS3(`${subdomain}/layout.json`, 'site not found in s3');
    let domainName = subdomain + '.vercel.app';
    let altDomain = subdomain + '-lp' + '' + '.vercel.app';
    if (typeof siteLayout != 'string') {
        //new check with layout file
        let publishedDomains = siteLayout.publishedDomains ? siteLayout.publishedDomains : [];
        const isDomainPublishedAlready = publishedDomains.filter((domain) => domain === domainName).length;
        const isAltDomainPublishedAlready = publishedDomains.filter((domain) => domain === altDomain).length;
        console.log('is pub already', isDomainPublishedAlready);
        if (!isDomainPublishedAlready && !isAltDomainPublishedAlready) {
            console.log('domain: ', domainName);
            //vercep api url changes between post vs delete
            const vercelApiUrl = `https://api.vercel.com/v10/projects/${process.env.VERCEL_PROJECT_ID}/domains?teamId=${process.env.NEXT_PUBLIC_VERCEL_TEAM_ID}`;
            //Add or remove domain to vercel via vercel api
            const response = await fetch(vercelApiUrl, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_VERCEL_AUTH_TOKEN}`,
                },
                body: JSON.stringify({
                    name: domainName,
                }),
            });
            console.log('vercel domain response', response);
            //if domain name already exists try adding again with postfix
            if (response.status === 409) {
                console.log('domain already exists, adding -lp postfix');
                const secondDomainAttempt = await fetch(vercelApiUrl, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_VERCEL_AUTH_TOKEN}`,
                    },
                    body: JSON.stringify({
                        name: subdomain + '-lp' + '.vercel.app',
                    }),
                });
                if (secondDomainAttempt.status === 409) {
                    throw new SiteDeploymentError({
                        message: `domain "${domainName}" and altered domain "${subdomain}-lp.vercel.app" both already taken in another project`,
                        domain: domainName,
                        errorType: 'DMN-001',
                        state: {
                            domainStatus: 'Domain not added for project',
                        },
                    });
                }
                else {
                    domainName = subdomain + '-lp' + '.vercel.app';
                    await modifyDomainPublishStatus('POST', siteLayout, domainName, subdomain);
                    if (await verifyDomain(domainName)) {
                        return {
                            message: `domain added with postfix -lp because other domain is taken`,
                            domain: domainName,
                            status: 'Success',
                        };
                    }
                    else {
                        throw new SiteDeploymentError({
                            message: 'Unable to verify domain has been published',
                            domain: domainName,
                            errorType: 'DMN-002',
                            state: {
                                domainStatus: 'Domain not added for project',
                            },
                        });
                    }
                }
            }
            else {
                await modifyDomainPublishStatus('POST', siteLayout, domainName, subdomain);
            }
        }
        else {
            return {
                message: 'domain already published, updating site data',
                domain: `${publishedDomains[0] + (pageUri ? `/${pageUri}` : '')}`,
                status: 'Success',
            };
        }
    }
    else {
        throw new SiteDeploymentError({
            message: `ApexID ${subdomain} not found in list of created sites`,
            domain: domainName,
            errorType: 'AMS-006',
            state: {
                domainStatus: 'Domain not added for project',
            },
        });
    }
    if (await verifyDomain(domainName)) {
        return { message: `site domain published'`, domain: `${domainName + (pageUri ? `/${pageUri}` : '')}`, status: 'Success' };
    }
    else {
        throw new SiteDeploymentError({
            message: 'Unable to verify domain has been published',
            domain: domainName,
            errorType: 'DMN-002',
            state: {
                domainStatus: 'Domain not added for project',
            },
        });
    }
};
export const changePublishStatusInSiteData = async (subdomain, status) => {
    let siteLayoutFile = await getFileS3(`${subdomain}/layout.json`, 'site not found in s3');
    if (typeof siteLayoutFile != 'string') {
        siteLayoutFile.published = status;
        await addFileS3(siteLayoutFile, `${subdomain}/layout`);
        return `Domain: ${subdomain} publish status changed`;
    }
    else {
        return `Error: ${subdomain} not found in s3`;
    }
};
//add created site params to list in s3
//may not be needed later if we can check s3 for folder
export const addToSiteList = async (websiteData) => {
    const basePath = websiteData.subdomain;
    websiteData.publishedDomains = [];
    const currentSiteList = await getFileS3(`sites/site-list.json`, []);
    console.log('current site list', currentSiteList);
    //Add site to s3 site-list if it is not already there
    if (currentSiteList.filter((site) => site.subdomain === basePath).length <= 0) {
        currentSiteList.push(websiteData);
        console.log('new site list', currentSiteList);
        await addFileS3(currentSiteList, `sites/site-list`);
        return `Site added, ClientId: ${websiteData.id}, Subdomain: ${websiteData.subdomain}  `;
    }
    else {
        throw new Error(`Site has already been created, ClientId: ${websiteData.clientId}, Subdomain: ${websiteData.subdomain}  `);
    }
};
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
    const domainList = await getFileS3(`sites/domains.json`, []);
    return domainList;
};
export async function checkIfSiteExistsPostgres(domain) {
    try {
        const domainCheck = await sql `SELECT * FROM Domains WHERE domain = ${domain};`;
        const domainExists = domainCheck.rowCount > 0 ? true : false;
        const foundStatus = domainExists === true ? 'site exists' : 'not found';
        console.log(foundStatus);
        return foundStatus;
    }
    catch (error) {
        console.log(error);
        throw { 'this is error': { error } };
    }
}
export const removeDomainFromVercel = async (subdomain) => {
    const apexID = convertUrlToApexId(subdomain, false);
    const siteLayout = await getFileS3(`${apexID}/layout.json`, 'site not found in s3');
    let domainName = subdomain;
    if (typeof siteLayout != 'string') {
        //check that this url is tied with the S3 layout published domains field
        let publishedDomains = siteLayout.publishedDomains ? siteLayout.publishedDomains : [];
        const isDomainPublishedAlready = publishedDomains.filter((domain) => domain === domainName).length;
        if (isDomainPublishedAlready) {
            console.log('domain: ', domainName);
            //vercep api url changes between post vs delete
            const vercelApiUrl = `https://api.vercel.com/v10/projects/${process.env.VERCEL_PROJECT_ID}/domains/${domainName}?teamId=${process.env.NEXT_PUBLIC_VERCEL_TEAM_ID}`;
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
                });
                console.log('vercel domain response', response);
                await modifyDomainPublishStatus('DELETE', siteLayout, domainName, subdomain);
            }
            catch (err) {
                throw new SiteDeploymentError({
                    message: err.message,
                    domain: domainName,
                    errorType: 'GEN-003',
                    state: {
                        domainStatus: 'Domain unable to be removed from project',
                    },
                });
            }
        }
        else {
            throw new SiteDeploymentError({
                message: `'domain cannot be removed as it is not connected to the apexID S3 folder`,
                domain: domainName,
                errorType: 'AMS-006',
                state: {
                    domainStatus: 'Domain unable to be removed as it was not found in S3 check',
                },
            });
        }
    }
    else {
        throw new SiteDeploymentError({
            message: `ApexID ${apexID} not found in list of created sites`,
            domain: domainName,
            errorType: 'AMS-006',
            state: {
                domainStatus: 'Domain unable to be removed as it was not found in S3 check',
            },
        });
    }
    return { message: `site domain unpublished`, domain: domainName, status: 'Success' };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLXNpdGUtY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb250cm9sbGVycy9jcmVhdGUtc2l0ZS1jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBQzVELE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLE1BQU0sNkJBQTZCLENBQUE7QUFDbEUsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLGtCQUFrQixDQUFBO0FBQ3RDLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHVCQUF1QixDQUFBO0FBRTFELE1BQU0seUJBQXlCLEdBQUcsS0FBSyxFQUFFLE1BQWMsRUFBRSxVQUFlLEVBQUUsVUFBa0IsRUFBRSxTQUFpQixFQUFFLEVBQUU7SUFDL0csbURBQW1EO0lBQ25ELElBQUksTUFBTSxLQUFLLE1BQU0sRUFBRSxDQUFDO1FBQ3BCLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFBO1FBQ3pILE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsVUFBVSxDQUFDLGdCQUFnQixDQUFDLENBQUE7SUFDakUsQ0FBQztTQUFNLElBQUksTUFBTSxLQUFLLFFBQVEsRUFBRSxDQUFDO1FBQzdCLG1DQUFtQztRQUNuQyxVQUFVLENBQUMsZ0JBQWdCLEdBQUcsVUFBVSxDQUFDLGdCQUFnQixFQUFFLE1BQU0sQ0FBQyxDQUFDLE1BQWMsRUFBRSxFQUFFLENBQUMsTUFBTSxJQUFJLFVBQVUsQ0FBQyxDQUFBO0lBQy9HLENBQUM7SUFDRCxNQUFNLFNBQVMsQ0FBQyxVQUFVLEVBQUUsR0FBRyxTQUFTLFNB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