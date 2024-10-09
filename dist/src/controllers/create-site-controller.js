import { SiteDeploymentError } from '../utilities/errors.js';
import { addFileS3, getFileS3 } from '../utilities/s3Functions.js';
import { sql } from '@vercel/postgres';
import { checkApexIDInDomain, convertUrlToApexId, createRandomFiveCharString } from '../utilities/utils.js';
const previewPostFix = '.vercel.app';
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
    const postfix = domainOptions.usingPreview ? previewPostFix : '';
    let domainName = domainOptions.domain + postfix;
    let randomString = createRandomFiveCharString();
    let randomStringDomain = domainOptions.domain + '-' + randomString;
    let altDomain = randomStringDomain + postfix;
    //check if s3 folder exists for domain
    if (typeof siteLayout != 'string') {
        let publishedDomains = siteLayout.publishedDomains ? siteLayout.publishedDomains : [];
        const isDomainPublishedAlready = publishedDomains.filter((domain) => domain === domainName).length;
        //check if a random char generated domain has already been published
        const publishedAltDomain = publishedDomains.filter((domain) => checkApexIDInDomain(domain, domainOptions, postfix));
        if (publishedAltDomain.length) {
            console.log('already an alt domain');
            domainName = publishedAltDomain[0];
        }
        //check if domain has already been published
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
                    }
                }
                domainName = altDomain;
                await createRedirectFile(domainName, apexID);
                //isDomainConfigCorrect(domainName, domainOptions, apexID, pageUri)
                /* const configData = await checkDomainConfigOnVercel(domainName)
                if (configData.misconfigured) {
                    const newDomainOptions = {
                        ...domainOptions,
                        domain: apexID + previewPostFix,
                        usingPreview:true,
                    }
                    return publishDomainToVercel(newDomainOptions, apexID, pageUri || '')
                } */
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
            //check config to see if prod domain is set up correctly
            if (!domainName.includes(previewPostFix) && !domainOptions.usingPreview) {
                const configData = await checkDomainConfigOnVercel(domainName);
                const publishedPreviewDomains = publishedDomains.filter((domain) => domain.includes(previewPostFix));
                const previewDomain = publishedPreviewDomains[0];
                //check if the domain being used is configured yet?
                if (configData.misconfigured) {
                    const previewDomainWithSlug = previewDomain + (pageUri ? `/${pageUri}` : '');
                    return {
                        message: `production domain ${domainName} is still not configured, here is the preview domain ${previewDomainWithSlug}`,
                        domain: previewDomainWithSlug,
                        status: 'Success',
                    };
                }
            }
            //Set message to note previous attempt if relevant
            const message = domainOptions.previousAttempt
                ? `Original domain ${domainOptions.previousAttempt} has been added but the domain configuration is not set up. Adding a preview free domain to use in the meantime`
                : 'domain already published, updating site data';
            return {
                message: message,
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
    //check domain configuration status
    const configData = await checkDomainConfigOnVercel(domainName);
    if (configData.misconfigured) {
        const newDomainOptions = {
            domain: apexID,
            usingPreview: true,
            previousAttempt: domainName,
        };
        return publishDomainToVercel(newDomainOptions, apexID, pageUri || '');
    }
    //verify the domain is live
    if (await verifyDomain(domainName)) {
        //if a previous domain was added with a misconfigured config then return a preview URL
        if (domainOptions.previousAttempt) {
            return {
                message: `Original domain ${domainOptions.previousAttempt} has been added but the domain configuration is not set up. Adding a preview free domain to use in the meantime`,
                domain: `${domainName + (pageUri ? `/${pageUri}` : '')}`,
                status: 'Success',
            };
        }
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
    //if using a redirect file change the apexID to the redirected ID
    if (typeof redirectFile != 'string' && redirectFile.apexId) {
        console.log('redirect file has been found', redirectFile.apexId);
        finalApexID = redirectFile.apexId;
    }
    const siteLayout = await getFileS3(`${finalApexID}/layout.json`, 'site not found in s3');
    let domainName = domain;
    if (typeof siteLayout != 'string') {
        //check that this url is tied with the S3 layout published domains field
        let publishedDomains = siteLayout.publishedDomains ? siteLayout.publishedDomains : [];
        const isDomainPublishedAlready = publishedDomains.filter((listedDomain) => listedDomain === domainName).length;
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
const buildDNSRecords = (aValues) => {
    const records = aValues.map((ip) => ({
        type: 'A',
        host: '@',
        value: ip,
        ttl: 3600,
    }));
    return records;
};
export const fetchDomainConfig = async (domain) => {
    const res = await fetch(`https://api.vercel.com/v6/domains/${domain}/config?strict=true&teamId=${process.env.NEXT_PUBLIC_VERCEL_TEAM_ID}`, {
        headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_VERCEL_AUTH_TOKEN}`,
        },
        method: 'get',
    });
    if (!res.ok) {
        console.error('Error fetching domain config:', res.statusText);
        throw new Error('Error checking domain config');
    }
    const data = await res.json();
    console.log(data);
    return data;
};
export const checkDomainConfigOnVercel = async (domain) => {
    try {
        const data = await fetchDomainConfig(domain || '');
        const misconfigured = data.misconfigured;
        let dnsRecords;
        if (misconfigured) {
            console.log('the domain is not configured');
            dnsRecords = buildDNSRecords(data.aValues);
        }
        return {
            misconfigured: misconfigured,
            dnsRecords: dnsRecords,
            cNames: data.cNames,
            domain: domain,
        };
    }
    catch (err) {
        throw new SiteDeploymentError({
            message: `Error checking domain config: ${err}`,
            domain: domain || '',
            errorType: 'DMN-009',
            state: {
                domainStatus: 'Unable to check domains config in Vercel',
            },
        });
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLXNpdGUtY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb250cm9sbGVycy9jcmVhdGUtc2l0ZS1jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBQzVELE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLE1BQU0sNkJBQTZCLENBQUE7QUFDbEUsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLGtCQUFrQixDQUFBO0FBQ3RDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxrQkFBa0IsRUFBRSwwQkFBMEIsRUFBRSxNQUFNLHVCQUF1QixDQUFBO0FBRTNHLE1BQU0sY0FBYyxHQUFHLGFBQWEsQ0FBQTtBQUVwQyxNQUFNLHlCQUF5QixHQUFHLEtBQUssRUFBRSxNQUFjLEVBQUUsVUFBZSxFQUFFLFVBQWtCLEVBQUUsTUFBYyxFQUFFLEVBQUU7SUFDNUcsbURBQW1EO0lBQ25ELElBQUksTUFBTSxLQUFLLE1BQU0sRUFBRSxDQUFDO1FBQ3BCLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFBO1FBQ3pILE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsVUFBVSxDQUFDLGdCQUFnQixDQUFDLENBQUE7SUFDakUsQ0FBQztTQUFNLElBQUksTUFBTSxLQUFLLFFBQVEsRUFBRSxDQUFDO1FBQzdCLG1DQUFtQztRQUNuQyxVQUFVLENBQUMsZ0JBQWdCLEdBQUcsVUFBVSxDQUFDLGdCQUFnQixFQUFFLE1BQU0sQ0FBQyxDQUFDLE1BQWMsRUFBRSxFQUFFLENBQUMsTUFBTSxJQUFJLFVBQVUsQ0FBQyxDQUFB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