import { SiteDeploymentError } from '../utilities/errors.js';
import { addFileS3, getFileS3 } from '../utilities/s3Functions.js';
import { checkApexIDInDomain, convertUrlToApexId, createRandomFiveCharString } from '../utilities/utils.js';
import { checkPageListForDeployements, createRedirectFile, getPageandLanding } from './create-site-controller.js';
const previewPostFix = '.vercel.app';
export const modifyDomainPublishStatus = async (method, siteLayout, domainName, apexId, pathName = `${apexId}/layout`) => {
    //add domains to layout file or removes if deleting
    if (method === 'POST') {
        siteLayout.publishedDomains ? siteLayout.publishedDomains.push(domainName) : (siteLayout.publishedDomains = [domainName]);
        console.log('published domains', siteLayout.publishedDomains);
    }
    else if (method === 'DELETE') {
        //remove site from list if deleting
        siteLayout.publishedDomains = siteLayout.publishedDomains?.filter((domain) => domain != domainName);
    }
    await addFileS3(siteLayout, pathName);
};
export const modifyLandingDomainPublishStatus = async (method, sitePage, domainName, apexId, pathName = `${apexId}/layout`) => {
    //add domains to layout file or removes if deleting
    if (method === 'POST') {
        //check if domain is already in published list
        const domainInDomainList = sitePage.siteLayout?.publishedDomains?.filter((domain) => domain === domainName);
        if (domainInDomainList.length > 0) {
            console.log('domain already in published list');
            return;
        }
        sitePage.siteLayout.publishedDomains ? sitePage.siteLayout?.publishedDomains.push(domainName) : (sitePage.siteLayout.publishedDomains = [domainName]);
        console.log('published domains', sitePage.siteLayout?.publishedDomains);
    }
    else if (method === 'DELETE') {
        //remove site from list if deleting
        sitePage.siteLayout.publishedDomains = sitePage.siteLayout?.publishedDomains?.filter((domain) => domain != domainName);
    }
    console.log('mod doms', sitePage.siteLayout.publishedDomains);
    await addFileS3(sitePage, pathName);
};
//verify domain has been added to project
export const verifyDomain = async (domainName) => {
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
export const publishDomainToVercel = async (domainOptions, apexID, pageUri = '', type = 'landing') => {
    //const siteLayout = await getPageLayoutVars(apexID, pageUri)
    const { siteLayout, sitePage } = await getPageandLanding(apexID, pageUri, type);
    /* let { siteLayout, sitePage } = await getPageandLanding(apexID, pageUri, type)
    if (!siteLayout) {
        siteLayout = await getPageLayoutVars(apexID, pageUri)
    } */
    const postfix = domainOptions.usingPreview ? previewPostFix : '';
    let domainName = domainOptions.domain + postfix;
    let randomString = createRandomFiveCharString();
    let randomStringDomain = domainOptions.domain + '-' + randomString;
    let altDomain = randomStringDomain + postfix;
    //check if s3 folder exists for domain
    if (typeof siteLayout != 'string' && siteLayout) {
        let publishedDomains = siteLayout.publishedDomains ? siteLayout.publishedDomains : [];
        const isDomainPublishedAlready = publishedDomains.filter((domain) => domain === domainName).length;
        //check if a random char generated domain has already been published
        const publishedAltDomain = publishedDomains.filter((domain) => checkApexIDInDomain(domain, domainOptions, postfix));
        if (publishedAltDomain.length) {
            console.log('already an alt domain');
            domainName = publishedAltDomain[0];
        }
        const domainAlreadyPublishedWithOtherPage = await checkPageListForDeployements(apexID, pageUri, domainName);
        //check if domain has already been published
        if (!isDomainPublishedAlready && !publishedAltDomain.length && !domainAlreadyPublishedWithOtherPage) {
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
                await createRedirectFile(domainName, apexID, pageUri);
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
                    if (type === 'landing' && sitePage?.siteLayout) {
                        await modifyLandingDomainPublishStatus('POST', sitePage, domainName, apexID, `${apexID}/pages/${pageUri}`);
                    }
                    else {
                        await modifyDomainPublishStatus('POST', siteLayout, domainName, apexID, `${apexID}/layout`);
                    }
                    return {
                        message: `domain added with postfix ${altDomain + (pageUri ? `/${pageUri}` : '')} because other domain is taken`,
                        domain: domainName,
                        status: 'Success',
                    };
                }
                else {
                    throw new SiteDeploymentError({
                        message: 'Unable to verify domain has been published',
                        domain: domainName + (pageUri ? `/${pageUri}` : ''),
                        errorType: 'DMN-002',
                        state: {
                            domainStatus: 'Domain not added for project',
                        },
                    });
                }
            }
            else {
                if (type === 'landing' && sitePage?.siteLayout) {
                    await modifyLandingDomainPublishStatus('POST', sitePage, domainName, apexID, `${apexID}/pages/${pageUri}`);
                }
                else {
                    await modifyDomainPublishStatus('POST', siteLayout, domainName, apexID, `${apexID}/layout`);
                }
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
            //check here if page is in publishedDomains?
            //domain has already been published with another page but we need to add it to json page file
            if (domainAlreadyPublishedWithOtherPage && !isDomainPublishedAlready) {
                console.log('adjusting page-list');
                if (type === 'landing' && sitePage?.siteLayout) {
                    await modifyLandingDomainPublishStatus('POST', sitePage, domainName, apexID, `${apexID}/pages/${pageUri}`);
                }
                else {
                    await modifyDomainPublishStatus('POST', siteLayout, domainName, apexID, `${apexID}/layout`);
                }
            }
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
    await createRedirectFile(domainName, apexID, pageUri);
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
export const removeDomainFromVercel = async (domain, pageUri = '', type = 'landing') => {
    const apexID = convertUrlToApexId(domain, false);
    //check here if redirect file, if so follow breadcrumbs to get to layout
    const redirectFile = await getFileS3(`${apexID}/redirect.json`, 'no redirect found');
    let finalApexID = apexID;
    //if using a redirect file change the apexID to the redirected ID
    if (typeof redirectFile != 'string' && redirectFile.apexId) {
        console.log('redirect file has been found', redirectFile.apexId);
        finalApexID = redirectFile.apexId;
    }
    const { siteLayout, sitePage } = await getPageandLanding(finalApexID, pageUri, type);
    let domainName = domain;
    if (typeof siteLayout != 'string' && siteLayout) {
        //check that this url is tied with the S3 layout published domains field
        let publishedDomains = siteLayout.publishedDomains ? siteLayout.publishedDomains : [];
        const isDomainPublishedAlready = publishedDomains.filter((listedDomain) => listedDomain === domainName).length;
        //check here for page-list length, only delete url if no more?
        const domainAlreadyPublishedWithOtherPage = await checkPageListForDeployements(apexID, pageUri, domainName);
        if (domainAlreadyPublishedWithOtherPage) {
            //remove page from publishedlist
            if (type === 'landing' && sitePage?.siteLayout) {
                await modifyLandingDomainPublishStatus('DELETE', sitePage, domainName, finalApexID, `${finalApexID}/pages/${pageUri}`);
            }
            else {
                await modifyDomainPublishStatus('DELETE', siteLayout, domainName, finalApexID, `$finalAapexID}/layout`);
            }
            return { message: `landing page ${pageUri} deleted, domain remains unchanged due to other pages existing`, domain: domainName, status: 'Success' };
        }
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
                if (type === 'landing' && sitePage?.siteLayout) {
                    await modifyLandingDomainPublishStatus('DELETE', sitePage, domainName, finalApexID, `${finalApexID}/pages/${pageUri}`);
                }
                else {
                    await modifyDomainPublishStatus('DELETE', siteLayout, domainName, finalApexID, `$finalAapexID}/layout`);
                }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tYWluLWNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29udHJvbGxlcnMvZG9tYWluLWNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sd0JBQXdCLENBQUE7QUFDNUQsT0FBTyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQTtBQUNsRSxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsa0JBQWtCLEVBQUUsMEJBQTBCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQTtBQUUzRyxPQUFPLEVBQUUsNEJBQTRCLEVBQUUsa0JBQWtCLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQTtBQUNqSCxNQUFNLGNBQWMsR0FBRyxhQUFhLENBQUE7QUFFcEMsTUFBTSxDQUFDLE1BQU0seUJBQXlCLEdBQUcsS0FBSyxFQUFFLE1BQWMsRUFBRSxVQUFlLEVBQUUsVUFBa0IsRUFBRSxNQUFjLEVBQUUsUUFBUSxHQUFHLEdBQUcsTUFBTSxTQUFTLEVBQUUsRUFBRTtJQUNsSixtREFBbUQ7SUFDbkQsSUFBSSxNQUFNLEtBQUssTUFBTSxFQUFFO1FBQ25CLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFBO1FBQ3pILE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsVUFBVSxDQUFDLGdCQUFnQixDQUFDLENBQUE7S0FDaEU7U0FBTSxJQUFJLE1BQU0sS0FBSyxRQUFRLEVBQUU7UUFDNUIsbUNBQW1DO1FBQ25DLFVBQVUsQ0FBQyxnQkFBZ0IsR0FBRyxVQUFVLENBQUMsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDLENBQUMsTUFB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