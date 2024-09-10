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
const createRandomFiveCharString = () => {
    return (Math.random() + 1).toString(36).substring(5);
};
//takes a site domain and either adds it to vercel or removes it depending on method (POST or DELETE)
export const publishDomainToVercel = async (domainOptions, apexID, pageUri = '') => {
    const siteLayout = await getFileS3(`${apexID}/layout.json`, 'site not found in s3');
    const postfix = domainOptions.usingPreview ? '.vercel.app' : '';
    let domainName = domainOptions.domain + postfix;
    let randomString = createRandomFiveCharString();
    let randomStringDomain = domainOptions.domain + '-' + randomString;
    let altDomain = randomStringDomain + postfix;
    console.log('domainNametest', domainName);
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