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
    console.log('premod doms', sitePage.siteLayout);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tYWluLWNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29udHJvbGxlcnMvZG9tYWluLWNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sd0JBQXdCLENBQUE7QUFDNUQsT0FBTyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQTtBQUVsRSxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsa0JBQWtCLEVBQUUsMEJBQTBCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQTtBQUczRyxPQUFPLEVBQUUsNEJBQTRCLEVBQUUsa0JBQWtCLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQTtBQUVqSCxNQUFNLGNBQWMsR0FBRyxhQUFhLENBQUE7QUFFcEMsTUFBTSxDQUFDLE1BQU0seUJBQXlCLEdBQUcsS0FBSyxFQUFFLE1BQWMsRUFBRSxVQUFlLEVBQUUsVUFBa0IsRUFBRSxNQUFjLEVBQUUsUUFBUSxHQUFHLEdBQUcsTUFBTSxTQUFTLEVBQUUsRUFBRTtJQUNsSixtREFBbUQ7SUFDbkQsSUFBSSxNQUFNLEtBQUssTUFBTSxFQUFFLENBQUM7UUFDcEIsVUFBVSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUE7UUFDekgsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxVQUFVLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtJQUNqRSxDQUFDO1NBQU0sSUFBSSxNQUFNLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDN0IsbUNBQW1DO1FBQ25DLFVBQVUsQ0FBQyxnQkFBZ0IsR0FBRyxVQUFVLENBQUMsZ0JBQWdCLEVBQUUsTUFB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