import { SiteDeploymentError } from '../utilities/errors.js';
import { addFileS3, getFileS3 } from '../utilities/s3Functions.js';
import { sql } from '@vercel/postgres';
import { checkApexIDInDomain, convertUrlToApexId, createRandomFiveCharString } from '../utilities/utils.js';
const modifyDomainPublishStatus = async (method, siteLayout, domainName, apexId) => {
    //add domains to layout file or removes if deleting
    if (method === 'POST') {
        siteLayout.publishedDomains ? siteLayout.publishedDomains.push(domainName) : (siteLayout.publishedDomains = [domainName]);
        console.log('published domains', siteLayout.publishedDomains);
    }
    else if (method === 'DELETE') {
        //remove site from list if deleting
        siteLayout.publishedDomains = siteLayout.publishedDomains?.filter((domain) => domain != domainName);
    }
    await addFileS3(siteLayout, `${apexId}/layout`);
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
export const publishDomainToVercel = async (domainOptions, apexID, pageUri = '') => {
    const siteLayout = await getFileS3(`${apexID}/layout.json`, 'site not found in s3');
    const postfix = domainOptions.usingPreview ? '.vercel.app' : '';
    let domainName = domainOptions.domain + postfix;
    let randomString = createRandomFiveCharString();
    let randomStringDomain = domainOptions.domain + '-' + randomString;
    let altDomain = randomStringDomain + postfix;
    if (typeof siteLayout != 'string') {
        //new check with layout file
        let publishedDomains = siteLayout.publishedDomains ? siteLayout.publishedDomains : [];
        const isDomainPublishedAlready = publishedDomains.filter((domain) => domain === domainName).length;
        //check if a random char generated domain has already been published
        const publishedAltDomain = publishedDomains.filter((domain) => checkApexIDInDomain(domain, domainOptions, postfix));
        if (publishedAltDomain.length) {
            domainName = publishedAltDomain[0];
        }
        if (!isDomainPublishedAlready && !publishedAltDomain.length) {
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
            let tries = 0;
            if (response.status === 409) {
                if (!domainOptions.usingPreview) {
                    throw new SiteDeploymentError({
                        message: `production domain "${domainOptions.domain}" is taken and another domain must be provided`,
                        domain: domainName,
                        errorType: 'DMN-008',
                        state: {
                            domainStatus: 'Domain not added for project',
                        },
                    });
                }
                tries += 1;
                console.log(`domain already exists, adding random char postfix try number ${tries}`);
                const secondDomainAttempt = await fetch(vercelApiUrl, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_VERCEL_AUTH_TOKEN}`,
                    },
                    body: JSON.stringify({
                        name: altDomain,
                    }),
                });
                if (secondDomainAttempt.status === 409) {
                    tries += 1;
                    console.log(`domain already exists again, adding random char postfix try number ${tries}`);
                    altDomain = domainOptions.domain + '-' + createRandomFiveCharString() + postfix;
                    const thirdDomainAttempt = await fetch(vercelApiUrl, {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${process.env.NEXT_PUBLIC_VERCEL_AUTH_TOKEN}`,
                        },
                        body: JSON.stringify({
                            name: altDomain,
                        }),
                    });
                    if (thirdDomainAttempt.status === 409) {
                        throw new SiteDeploymentError({
                            message: `domain "${domainName}" and altered domain "${altDomain}" both already taken in another project`,
                            domain: domainName,
                            errorType: 'DMN-001',
                            state: {
                                domainStatus: 'Domain not added for project',
                            },
                        });
                    } /* else {
                        //domainName = subdomain + '-lp' + postfix
                    domainName = altDomain
                    await modifyDomainPublishStatus('POST', siteLayout, domainName, subdomain)
                    if (await verifyDomain(domainName)) {
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
                    } */
                }
                //domainName = subdomain + '-lp' + postfix
                domainName = altDomain;
                await createRedirectFile(domainName, apexID);
                if (await verifyDomain(domainName)) {
                    await modifyDomainPublishStatus('POST', siteLayout, domainName, apexID);
                    return {
                        message: `domain added with postfix ${altDomain} because other domain is taken`,
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
            else {
                await modifyDomainPublishStatus('POST', siteLayout, domainName, apexID);
            }
        }
        else {
            return {
                message: 'domain already published, updating site data',
                domain: `${domainName + (pageUri ? `/${pageUri}` : '')}`,
                status: 'Success',
            };
        }
    }
    else {
        throw new SiteDeploymentError({
            message: `ApexID ${apexID} not found in list of created sites`,
            domain: domainName,
            errorType: 'AMS-006',
            state: {
                domainStatus: 'Domain not added for project',
            },
        });
    }
    await createRedirectFile(domainName, apexID);
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
const createRedirectFile = async (domainName, apexID) => {
    if (convertUrlToApexId(domainName) != apexID) {
        console.log('creating redirect file for: ', domainName);
        const redirectFile = {
            apexId: apexID,
        };
        await addFileS3(redirectFile, `${convertUrlToApexId(domainName)}/redirect`);
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
export const removeDomainFromVercel = async (domain) => {
    const apexID = convertUrlToApexId(domain, false);
    //check here if redirect file, if so followo breadcrumbs to get to layout
    const redirectFile = await getFileS3(`${apexID}/redirect.json`, 'no redirect found');
    let finalApexID = apexID;
    if (typeof redirectFile != 'string' && redirectFile.apexId) {
        console.log('redirect file has been found', redirectFile.apexId);
        finalApexID = redirectFile.apexId;
    }
    const siteLayout = await getFileS3(`${finalApexID}/layout.json`, 'site not found in s3');
    let domainName = domain;
    console.log('finalApexID', finalApexID);
    console.log('siteLayout where?', siteLayout);
    if (typeof siteLayout != 'string') {
        //check that this url is tied with the S3 layout published domains field
        let publishedDomains = siteLayout.publishedDomains ? siteLayout.publishedDomains : [];
        const isDomainPublishedAlready = publishedDomains.filter((listedDomain) => listedDomain === domainName).length;
        console.log('isDomainPublishedAlready?', isDomainPublishedAlready);
        console.log('domain list', publishedDomains);
        console.log('domain checking', domain);
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
                await modifyDomainPublishStatus('DELETE', siteLayout, domainName, finalApexID);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLXNpdGUtY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb250cm9sbGVycy9jcmVhdGUtc2l0ZS1jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBQzVELE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLE1BQU0sNkJBQTZCLENBQUE7QUFDbEUsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLGtCQUFrQixDQUFBO0FBQ3RDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxrQkFBa0IsRUFBRSwwQkFBMEIsRUFBRSxNQUFNLHVCQUF1QixDQUFBO0FBRTNHLE1BQU0seUJBQXlCLEdBQUcsS0FBSyxFQUFFLE1BQWMsRUFBRSxVQUFlLEVBQUUsVUFBa0IsRUFBRSxNQUFjLEVBQUUsRUFBRTtJQUM1RyxtREFBbUQ7SUFDbkQsSUFBSSxNQUFNLEtBQUssTUFBTSxFQUFFLENBQUM7UUFDcEIsVUFBVSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUE7UUFDekgsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxVQUFVLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtJQUNqRSxDQUFDO1NBQU0sSUFBSSxNQUFNLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDN0IsbUNBQW1DO1FBQ25DLFVBQVUsQ0FBQyxnQkFBZ0IsR0FBRyxVQUFVLENBQUMsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDLENBQUMsTUFBYyxFQUFFLEVBQUUsQ0FBQyxNQUFNLElBQUksVUFBVSxDQUFDLENBQUE7SUFDL0csQ0FBQztJQUNELE1BQU0sU0FBUyxDQUFD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