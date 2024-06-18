import { SiteDeploymentError } from '../errors.js';
import { addFileS3, getFileS3 } from '../s3Functions.js';
import { sql } from '@vercel/postgres';
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
export const publishDomainToVercel = async (subdomain) => {
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
                        errorID: 'DMN-001',
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
                            errorID: 'DMN-002',
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
                domain: publishedDomains[0],
                status: 'Success',
            };
        }
    }
    else {
        throw new SiteDeploymentError({
            message: `ApexID ${subdomain} not found in list of created sites`,
            domain: domainName,
            errorID: 'DMN-003',
        });
    }
    if (await verifyDomain(domainName)) {
        return { message: `site domainb published'`, domain: domainName, status: 'Success' };
    }
    else {
        throw new SiteDeploymentError({
            message: 'Unable to verify domain has been published',
            domain: domainName,
            errorID: 'DMN-002',
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
    const siteLayout = await getFileS3(`${subdomain}/layout.json`, 'site not found in s3');
    let domainName = subdomain;
    if (!subdomain.includes('.vercel.app')) {
        domainName = subdomain + '.vercel.app';
    }
    if (typeof siteLayout != 'string') {
        //new check with layout file
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
                    errorID: 'GEN-003',
                });
            }
        }
        else {
            throw new SiteDeploymentError({
                message: `'domain cannot be removed as it is not connected to the apexID`,
                domain: domainName,
                errorID: 'AMS-006',
            });
        }
    }
    else {
        throw new SiteDeploymentError({
            message: `ApexID ${subdomain} not found in list of created sites`,
            domain: domainName,
            errorID: 'AMS-006',
        });
    }
    return { message: `site domain unpublished`, domain: domainName, status: 'Success' };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLXNpdGUtY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb250cm9sbGVycy9jcmVhdGUtc2l0ZS1jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLGNBQWMsQ0FBQTtBQUNsRCxPQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxNQUFNLG1CQUFtQixDQUFBO0FBQ3hELE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQTtBQUV0QyxNQUFNLHlCQUF5QixHQUFHLEtBQUssRUFBRSxNQUFjLEVBQUUsVUFBZSxFQUFFLFVBQWtCLEVBQUUsU0FBaUIsRUFBRSxFQUFFO0lBQy9HLG1EQUFtRDtJQUNuRCxJQUFJLE1BQU0sS0FBSyxNQUFNLEVBQUUsQ0FBQztRQUNwQixVQUFVLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLGdCQUFnQixHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQTtRQUN6SCxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixFQUFFLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO0lBQ2pFLENBQUM7U0FBTSxJQUFJLE1BQU0sS0FBSyxRQUFRLEVBQUUsQ0FBQztRQUM3QixtQ0FBbUM7UUFDbkMsVUFBVSxDQUFDLGdCQUFnQixHQUFHLFVBQVUsQ0FBQyxnQkFBZ0IsRUFBRSxNQUFNLENBQUMsQ0FBQyxNQUFjLEVBQUUsRUFBRSxDQUFDLE1BQU0sSUFBSSxVQUFVLENBQUMsQ0FBQTtJQUMvRyxDQUFDO0lBQ0QsTUFBTSxTQUFTLENBQUMsVUFBVSxFQUFFLEdBQUcsU0FBUyxTQUFTLENBQUMsQ0FBQTtBQUN0RCxDQUFDLENBQUE7QUFFRCx5Q0FBeUM7QUFDekMs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