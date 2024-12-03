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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tYWluLWNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29udHJvbGxlcnMvZG9tYWluLWNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sd0JBQXdCLENBQUE7QUFDNUQsT0FBTyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQTtBQUNsRSxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsa0JBQWtCLEVBQUUsMEJBQTBCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQTtBQUUzRyxPQUFPLEVBQUUsNEJBQTRCLEVBQUUsa0JBQWtCLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQTtBQUNqSCxNQUFNLGNBQWMsR0FBRyxhQUFhLENBQUE7QUFFcEMsTUFBTSxDQUFDLE1BQU0seUJBQXlCLEdBQUcsS0FBSyxFQUFFLE1BQWMsRUFBRSxVQUFlLEVBQUUsVUFBa0IsRUFBRSxNQUFjLEVBQUUsUUFBUSxHQUFHLEdBQUcsTUFBTSxTQUFTLEVBQUUsRUFBRTtJQUNsSixtREFBbUQ7SUFDbkQsSUFBSSxNQUFNLEtBQUssTUFBTSxFQUFFLENBQUM7UUFDcEIsVUFBVSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUE7UUFDekgsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxVQUFVLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtJQUNqRSxDQUFDO1NBQU0sSUFBSSxNQUFNLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDN0IsbUNBQW1DO1FBQ25DLFVBQVUsQ0FBQyxnQkFBZ0IsR0FBRyxVQUFVLENBQUMsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDLENBQUMsTUFBYyxFQUFFLEVBQUUsQ0FBQyxNQUFNLElBQUksVUFBVSxDQUFDLENBQUE7SUFDL0csQ0FBQztJQUNELE1BQU0sU0FBUyxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQTtBQUN6QyxDQUFDLENBQUE7QUFFRCxNQUFNLENBQUMsTUFBTSxnQ0FBZ0MsR0FBRyxLQUFLLEVBQ2pELE1BQWMsRUFDZCxRQUFzQixFQUN0QixVQUFrQixFQUNsQixNQUFjLEVBQ2QsUUFBUSxHQUFHLEdBQUcsTUFBTSxTQUFTLEVBQy9CLEVBQUU7SUFDQSxtREFBbUQ7SUFDbkQsSUFBSSxNQUFNLEtBQUssTUFBTSxFQUFFLENBQUM7UUFDcEIsOENBQThDO1FBQzlDLE1BQU0sa0JBQWtCLEdBQUcsUUFBUSxDQUFDLFVBQVUsRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLENBQUMsQ0FBQyxNQUFjLEVBQUUsRUFBRSxDQUFDLE1BQU0sS0FBSyxVQUFVLENBQUMsQ0FBQTtRQUVuSCxJQUFJLGtCQUFrQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUNoQyxPQUFPLENBQUMsR0FBRyxDQUFDLGtDQUFrQyxDQUFDLENBQUE7WUFDL0MsT0FBTTtRQUNWLENBQUM7UUFFRCxRQUFRLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLGdCQUFnQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLGdCQUFnQixHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQTtRQUNySixPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixFQUFFLFFBQVEsQ0FBQyxVQUFVLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQTtJQUMzRSxDQUFDO1NBQU0sSUFBSSxNQUFNLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDN0IsbUNBQW1DO1FBQ25DLFFBQVEsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLEdBQUcsUUFBUSxDQUFDLFVBQVUsRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLENBQUMsQ0FBQyxNQUFjLEVBQUUsRUFBRSxDQUFDLE1BQU0sSUFBSSxVQUFVLENBQUMsQ0FBQTtJQUNsSSxDQUFDO0lBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO0lBQzdELE1BQU0sU0FBUyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQTtBQUN2QyxDQUFDLENBQUE7QUFFRCx5Q0FBeUM7QUFDekMsTUFBTSxDQUFDLE1BQU0sWUFBWSxHQUFHLEtBQUssRUFBRSxVQUFrQixFQUFFLEVBQUU7SUFDckQsb0tBQW9LO0lBRXBLLE1BQU0sWUFBWSxHQUFHLFdBQVcsVUFBVSxFQUFFLENBQUE7SUFFNUMsMkNBQTJDO0lBQzNDLE1BQU0sZUFBZSxHQUFHLEtBQUssRUFBRSxHQUFXLEVBQUUsT0FBTyxHQUFHLENBQUMsRUFBRSxPQUFPLEdBQUcsSUFBSSxFQUFFLEVBQUU7UUFDdkUsS0FBSyxJQUFJLE9BQU8sR0FBRyxDQUFDLEVBQUUsT0FBTyxJQUFJLE9BQU8sRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUFDO1lBQ2xELE1BQU0sUUFBUSxHQUFHLE1BQU0sS0FBSyxDQUFDLEdBQUcsRUFBRTtnQkFDOUIsTUFBTSxFQUFFLEtBQUs7YUFDaEIsQ0FBQyxDQUFBO1lBRUYsSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFDO2dCQUMxQixPQUFPLENBQUMsR0FBRyxDQUFDLDRDQUE0QyxPQUFPLEVBQUUsQ0FBQyxDQUFBO2dCQUNsRSxPQUFPLElBQUksQ0FBQTtZQUNmLENBQUM7WUFFRCwyREFBMkQ7WUFDM0QsSUFBSSxPQUFPLEdBQUcsT0FBTyxFQUFFLENBQUM7Z0JBQ3BCLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0JBQXNCLE9BQU8sa0NBQWtDLENBQUMsQ0FBQTtnQkFDNUUsTUFBTSxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFBO1lBQ2hFLENBQUM7aUJBQU0sQ0FBQztnQkFDSixPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sT0FBTyxrQkFBa0IsQ0FBQyxDQUFBO2dCQUM3QyxPQUFPLEtBQUssQ0FBQTtZQUNoQixDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUMsQ0FBQTtJQUVELElBQUksQ0FBQztRQUNELE1BQU0sVUFBVSxHQUFHLE1BQU0sZUFBZSxDQUFDLFlBQVksQ0FBQyxDQUFBO1FBQ3RELE9BQU8sVUFBVSxDQUFBO0lBQ3JCLENBQUM7SUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ1gsTUFBTSxJQUFJLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQTtJQUM5QyxDQUFDO0FBQ0wsQ0FBQyxDQUFBO0FBRUQscUdBQXFHO0FBQ3JHLE1BQU0sQ0FBQyxNQUFNLHFCQUFxQixHQUFHLEtBQUssRUFBRSxhQUE0QixFQUFFLE1BQWMsRUFBRSxPQUFPLEdBQUcsRUFBRSxFQUFFLElBQUksR0FBRyxTQUFTLEVBQXNCLEVBQUU7SUFDNUksNkRBQTZEO0lBQzdELE1BQU0sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLEdBQUcsTUFBTSxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFBO0lBQy9FOzs7UUFHSTtJQUVKLE1BQU0sT0FBTyxHQUFHLGFBQWEsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFBO0lBQ2hFLElBQUksVUFBVSxHQUFHLGFBQWEsQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFBO0lBQy9DLElBQUksWUFBWSxHQUFHLDBCQUEwQixFQUFFLENBQUE7SUFDL0MsSUFBSSxrQkFBa0IsR0FBRyxhQUFhLENBQUMsTUFBTSxHQUFHLEdBQUcsR0FBRyxZQUFZLENBQUE7SUFDbEUsSUFBSSxTQUFTLEdBQUcsa0JBQWtCLEdBQUcsT0FBTyxDQUFBO0lBRTVDLHNDQUFzQztJQUN0QyxJQUFJLE9BQU8sVUFBVSxJQUFJLFFBQVEsSUFBSSxVQUFVLEVBQUUsQ0FBQztRQUM5QyxJQUFJLGdCQUFnQixHQUFHLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUE7UUFDckYsTUFBTSx3QkFBd0IsR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFjLEVBQUUsRUFBRSxDQUFDLE1BQU0sS0FBSyxVQUFVLENBQUMsQ0FBQyxNQUFNLENBQUE7UUFFMUcsb0VBQW9FO1FBQ3BFLE1BQU0sa0JBQWtCLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLEVBQUUsYUFBYSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUE7UUFDbkgsSUFBSSxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM1QixPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixDQUFDLENBQUE7WUFDcEMsVUFBVSxHQUFHLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3RDLENBQUM7UUFFRCxNQUFNLG1DQUFtQyxHQUFHLE1BQU0sNEJBQTRCLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQTtRQUUzRyw0Q0FBNEM7UUFDNUMsSUFBSSxDQUFDLHdCQUF3QixJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxJQUFJLENBQUMsbUNBQW1DLEVBQUUsQ0FBQztZQUNsRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQTtZQUVuQywrQ0FBK0M7WUFDL0MsTUFBTSxZQUFZLEdBQUcsdUNBQXVDLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLG1CQUFtQixPQUFPLENBQUMsR0FBRyxDQUFDLDBCQUEwQixFQUFFLENBQUE7WUFFcEosK0NBQStDO1lBQy9DLE1BQU0sUUFBUSxHQUFHLE1BQU0sS0FBSyxDQUFDLFlBQVksRUFBRTtnQkFDdkMsTUFBTSxFQUFFLE1BQU07Z0JBQ2QsT0FBTyxFQUFFO29CQUNMLGFBQWEsRUFBRSxVQUFVLE9BQU8sQ0FBQyxHQUFHLENBQUMsNkJBQTZCLEVBQUU7aUJBQ3ZFO2dCQUNELElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO29CQUNqQixJQUFJLEVBQUUsVUFBVTtpQkFDbkIsQ0FBQzthQUNMLENBQUMsQ0FBQTtZQUVGLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLEVBQUUsUUFBUSxDQUFDLENBQUE7WUFFL0MsNkRBQTZEO1lBQzdELElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQTtZQUNiLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQztnQkFDMUIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLEVBQUUsQ0FBQztvQkFDOUIsTUFBTSxJQUFJLG1CQUFtQixDQUFDO3dCQUMxQixPQUFPLEVBQUUsc0JBQXNCLGFBQWEsQ0FBQyxNQUFNLGdEQUFnRDt3QkFDbkcsTUFBTSxFQUFFLFVBQVU7d0JBQ2xCLFNBQVMsRUFBRSxTQUFTO3dCQUNwQixLQUFLLEVBQUU7NEJBQ0gsWUFBWSxFQUFFLDhCQUE4Qjt5QkFDL0M7cUJBQ0osQ0FBQyxDQUFBO2dCQUNOLENBQUM7Z0JBRUQsS0FBSyxJQUFJLENBQUMsQ0FBQTtnQkFDVixPQUFPLENBQUMsR0FBRyxDQUFDLGdFQUFnRSxLQUFLLEVBQUUsQ0FBQyxDQUFBO2dCQUVwRixNQUFNLG1CQUFtQixHQUFHLE1BQU0sS0FBSyxDQUFDLFlBQVksRUFBRTtvQkFDbEQsTUFBTSxFQUFFLE1BQU07b0JBQ2QsT0FBTyxFQUFFO3dCQUNMLGFBQWEsRUFBRSxVQUFVLE9BQU8sQ0FBQyxHQUFHLENBQUMsNkJBQTZCLEVBQUU7cUJBQ3ZFO29CQUNELElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO3dCQUNqQixJQUFJLEVBQUUsU0FBUztxQkFDbEIsQ0FBQztpQkFDTCxDQUFDLENBQUE7Z0JBRUYsSUFBSSxtQkFBbUIsQ0FBQyxNQUFNLEtBQUssR0FBRyxFQUFFLENBQUM7b0JBQ3JDLEtBQUssSUFBSSxDQUFDLENBQUE7b0JBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzRUFBc0UsS0FBSyxFQUFFLENBQUMsQ0FBQTtvQkFFMUYsU0FBUyxHQUFHLGFBQWEsQ0FBQyxNQUFNLEdBQUcsR0FBRyxHQUFHLDBCQUEwQixFQUFFLEdBQUcsT0FBTyxDQUFBO29CQUMvRSxNQUFNLGtCQUFrQixHQUFHLE1BQU0sS0FBSyxDQUFDLFlBQVksRUFBRTt3QkFDakQsTUFBTSxFQUFFLE1BQU07d0JBQ2QsT0FBTyxFQUFFOzRCQUNMLGFBQWEsRUFBRSxVQUFVLE9BQU8sQ0FBQyxHQUFHLENBQUMsNkJBQTZCLEVBQUU7eUJBQ3ZFO3dCQUNELElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDOzRCQUNqQixJQUFJLEVBQUUsU0FBUzt5QkFDbEIsQ0FBQztxQkFDTCxDQUFDLENBQUE7b0JBRUYsSUFBSSxrQkFBa0IsQ0FBQyxNQUFNLEtBQUssR0FBRyxFQUFFLENBQUM7d0JBQ3BDLE1BQU0sSUFBSSxtQkFBbUIsQ0FBQzs0QkFDMUIsT0FBTyxFQUFFLFdBQVcsVUFBVSx5QkFBeUIsU0FBUyx5Q0FBeUM7NEJBQ3pHLE1BQU0sRUFBRSxVQUFVOzRCQUNsQixTQUFTLEVBQUUsU0FBUzs0QkFDcEIsS0FBSyxFQUFFO2dDQUNILFlBQVksRUFBRSw4QkFBOEI7NkJBQy9DO3lCQUNKLENBQUMsQ0FBQTtvQkFDTixDQUFDO2dCQUNMLENBQUM7Z0JBQ0QsVUFBVSxHQUFHLFNBQVMsQ0FBQTtnQkFDdEIsTUFBTSxrQkFBa0IsQ0FBQyxVQUFVLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFBO2dCQUVyRCxtRUFBbUU7Z0JBQ25FOzs7Ozs7OztvQkFRSTtnQkFFSixJQUFJLE1BQU0sWUFBWSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7b0JBQ2pDLElBQUksSUFBSSxLQUFLLFNBQVMsSUFBSSxRQUFRLEVBQUUsVUFBVSxFQUFFLENBQUM7d0JBQzdDLE1BQU0sZ0NBQWdDLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLEdBQUcsTUFBTSxVQUFVLE9BQU8sRUFBRSxDQUFDLENBQUE7b0JBQzlHLENBQUM7eUJBQU0sQ0FBQzt3QkFDSixNQUFNLHlCQUF5QixDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxHQUFHLE1BQU0sU0FBUyxDQUFDLENBQUE7b0JBQy9GLENBQUM7b0JBRUQsT0FBTzt3QkFDSCxPQUFPLEVBQUUsNkJBQTZCLFNBQVMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLGdDQUFnQzt3QkFDaEgsTUFBTSxFQUFFLFVBQVU7d0JBQ2xCLE1BQU0sRUFBRSxTQUFTO3FCQUNwQixDQUFBO2dCQUNMLENBQUM7cUJBQU0sQ0FBQztvQkFDSixNQUFNLElBQUksbUJBQW1CLENBQUM7d0JBQzFCLE9BQU8sRUFBRSw0Q0FBNEM7d0JBQ3JELE1BQU0sRUFBRSxVQUFVLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQzt3QkFDbkQsU0FBUyxFQUFFLFNBQVM7d0JBQ3BCLEtBQUssRUFBRTs0QkFDSCxZQUFZLEVBQUUsOEJBQThCO3lCQUMvQztxQkFDSixDQUFDLENBQUE7Z0JBQ04sQ0FBQztZQUNMLENBQUM7aUJBQU0sQ0FBQztnQkFDSixJQUFJLElBQUksS0FBSyxTQUFTLElBQUksUUFBUSxFQUFFLFVBQVUsRUFBRSxDQUFDO29CQUM3QyxNQUFNLGdDQUFnQyxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxHQUFHLE1BQU0sVUFBVSxPQUFPLEVBQUUsQ0FBQyxDQUFBO2dCQUM5RyxDQUFDO3FCQUFNLENBQUM7b0JBQ0osTUFBTSx5QkFBeUIsQ0FBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsR0FBRyxNQUFNLFNBQVMsQ0FBQyxDQUFBO2dCQUMvRixDQUFDO1lBQ0wsQ0FBQztRQUNMLENBQUM7YUFBTSxDQUFDO1lBQ0osd0RBQXdEO1lBQ3hELElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUN0RSxNQUFNLFVBQVUsR0FBRyxNQUFNLHlCQUF5QixDQUFDLFVBQVUsQ0FBQyxDQUFBO2dCQUM5RCxNQUFNLHVCQUF1QixHQUFHLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFBO2dCQUNwRyxNQUFNLGFBQWEsR0FBRyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsQ0FBQTtnQkFFaEQsbURBQW1EO2dCQUNuRCxJQUFJLFVBQVUsQ0FBQyxhQUFhLEVBQUUsQ0FBQztvQkFDM0IsTUFBTSxxQkFBcUIsR0FBRyxhQUFhLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO29CQUM1RSxPQUFPO3dCQUNILE9BQU8sRUFBRSxxQkFBcUIsVUFBVSx3REFBd0QscUJBQXFCLEVBQUU7d0JBQ3ZILE1BQU0sRUFBRSxxQkFBcUI7d0JBQzdCLE1BQU0sRUFBRSxTQUFTO3FCQUNwQixDQUFBO2dCQUNMLENBQUM7WUFDTCxDQUFDO1lBRUQsa0RBQWtEO1lBQ2xELE1BQU0sT0FBTyxHQUFHLGFBQWEsQ0FBQyxlQUFlO2dCQUN6QyxDQUFDLENBQUMsbUJBQW1CLGFBQWEsQ0FBQyxlQUFlLGlIQUFpSDtnQkFDbkssQ0FBQyxDQUFDLDhDQUE4QyxDQUFBO1lBRXBELDRDQUE0QztZQUM1Qyw2RkFBNkY7WUFDN0YsSUFBSSxtQ0FBbUMsSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7Z0JBQ25FLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQTtnQkFDbEMsSUFBSSxJQUFJLEtBQUssU0FBUyxJQUFJLFFBQVEsRUFBRSxVQUFVLEVBQUUsQ0FBQztvQkFDN0MsTUFBTSxnQ0FBZ0MsQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsR0FBRyxNQUFNLFVBQVUsT0FBTyxFQUFFLENBQUMsQ0FBQTtnQkFDOUcsQ0FBQztxQkFBTSxDQUFDO29CQUNKLE1BQU0seUJBQXlCLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLEdBQUcsTUFBTSxTQUFTLENBQUMsQ0FBQTtnQkFDL0YsQ0FBQztZQUNMLENBQUM7WUFFRCxPQUFPO2dCQUNILE9BQU8sRUFBRSxPQUFPO2dCQUNoQixNQUFNLEVBQUUsR0FBRyxVQUFVLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFO2dCQUN4RCxNQUFNLEVBQUUsU0FBUzthQUNwQixDQUFBO1FBQ0wsQ0FBQztJQUNMLENBQUM7U0FBTSxDQUFDO1FBQ0osTUFBTSxJQUFJLG1CQUFtQixDQUFDO1lBQzFCLE9BQU8sRUFBRSxVQUFVLE1BQU0scUNBQXFDO1lBQzlELE1BQU0sRUFBRSxVQUFVO1lBQ2xCLFNBQVMsRUFBRSxTQUFTO1lBQ3BCLEtBQUssRUFBRTtnQkFDSCxZQUFZLEVBQUUsOEJBQThCO2FBQy9DO1NBQ0osQ0FBQyxDQUFBO0lBQ04sQ0FBQztJQUNELE1BQU0sa0JBQWtCLENBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQTtJQUVyRCxtQ0FBbUM7SUFDbkMsTUFBTSxVQUFVLEdBQUcsTUFBTSx5QkFBeUIsQ0FBQyxVQUFVLENBQUMsQ0FBQTtJQUM5RCxJQUFJLFVBQVUsQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUMzQixNQUFNLGdCQUFnQixHQUFHO1lBQ3JCLE1BQU0sRUFBRSxNQUFNO1lBQ2QsWUFBWSxFQUFFLElBQUk7WUFDbEIsZUFBZSxFQUFFLFVBQVU7U0FDOUIsQ0FBQTtRQUVELE9BQU8scUJBQXFCLENBQUMsZ0JBQWdCLEVBQUUsTUFBTSxFQUFFLE9BQU8sSUFBSSxFQUFFLENBQUMsQ0FBQTtJQUN6RSxDQUFDO0lBRUQsMkJBQTJCO0lBQzNCLElBQUksTUFBTSxZQUFZLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztRQUNqQyxzRkFBc0Y7UUFDdEYsSUFBSSxhQUFhLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDaEMsT0FBTztnQkFDSCxPQUFPLEVBQUUsbUJBQW1CLGFBQWEsQ0FBQyxlQUFlLGlIQUFpSDtnQkFDMUssTUFBTSxFQUFFLEdBQUcsVUFBVSxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRTtnQkFDeEQsTUFBTSxFQUFFLFNBQVM7YUFDcEIsQ0FBQTtRQUNMLENBQUM7UUFFRCxPQUFPLEVBQUUsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sRUFBRSxHQUFHLFVBQVUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLENBQUE7SUFDN0gsQ0FBQztTQUFNLENBQUM7UUFDSixNQUFNLElBQUksbUJBQW1CLENBQUM7WUFDMUIsT0FBTyxFQUFFLDRDQUE0QztZQUNyRCxNQUFNLEVBQUUsVUFBVTtZQUNsQixTQUFTLEVBQUUsU0FBUztZQUNwQixLQUFLLEVBQUU7Z0JBQ0gsWUFBWSxFQUFFLDhCQUE4QjthQUMvQztTQUNKLENBQUMsQ0FBQTtJQUNOLENBQUM7QUFDTCxDQUFDLENBQUE7QUFFRCxNQUFNLENBQUMsTUFBTSxzQkFBc0IsR0FBRyxLQUFLLEVBQUUsTUFBYyxFQUFFLE9BQU8sR0FBRyxFQUFFLEVBQUUsSUFBSSxHQUFHLFNBQVMsRUFBc0IsRUFBRTtJQUMvRyxNQUFNLE1BQU0sR0FBRyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUE7SUFFaEQsd0VBQXdFO0lBQ3hFLE1BQU0sWUFBWSxHQUFnQyxNQUFNLFNBQVMsQ0FBQyxHQUFHLE1BQU0sZ0JBQWdCLEVBQUUsbUJBQW1CLENBQUMsQ0FBQTtJQUVqSCxJQUFJLFdBQVcsR0FBRyxNQUFNLENBQUE7SUFFeEIsaUVBQWlFO0lBQ2pFLElBQUksT0FBTyxZQUFZLElBQUksUUFBUSxJQUFJLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUN6RCxPQUFPLENBQUMsR0FBRyxDQUFDLDhCQUE4QixFQUFFLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQTtRQUNoRSxXQUFXLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQTtJQUNyQyxDQUFDO0lBRUQsTUFBTSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsR0FBRyxNQUFNLGlCQUFpQixDQUFDLFdBQVcsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUE7SUFDcEYsSUFBSSxVQUFVLEdBQUcsTUFBTSxDQUFBO0lBRXZCLElBQUksT0FBTyxVQUFVLElBQUksUUFBUSxJQUFJLFVBQVUsRUFBRSxDQUFDO1FBQzlDLHdFQUF3RTtRQUN4RSxJQUFJLGdCQUFnQixHQUFHLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUE7UUFDckYsTUFBTSx3QkFBd0IsR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDLFlBQVksS0FBSyxVQUFVLENBQUMsQ0FBQyxNQUFNLENBQUE7UUFFOUcsOERBQThEO1FBQzlELE1BQU0sbUNBQW1DLEdBQUcsTUFBTSw0QkFBNEIsQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFBO1FBQzNHLElBQUksbUNBQW1DLEVBQUUsQ0FBQztZQUN0QyxnQ0FBZ0M7WUFDaEMsSUFBSSxJQUFJLEtBQUssU0FBUyxJQUFJLFFBQVEsRUFBRSxVQUFVLEVBQUUsQ0FBQztnQkFDN0MsTUFBTSxnQ0FBZ0MsQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsR0FBRyxXQUFXLFVBQVUsT0FBTyxFQUFFLENBQUMsQ0FBQTtZQUMxSCxDQUFDO2lCQUFNLENBQUM7Z0JBQ0osTUFBTSx5QkFBeUIsQ0FBQyxRQUFRLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsdUJBQXVCLENBQUMsQ0FBQTtZQUMzRyxDQUFDO1lBRUQsT0FBTyxFQUFFLE9BQU8sRUFBRSxnQkFBZ0IsT0FBTyxnRUFBZ0UsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsQ0FBQTtRQUN0SixDQUFDO1FBRUQsSUFBSSx3QkFBd0IsRUFBRSxDQUFDO1lBQzNCLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFBO1lBRW5DLCtDQUErQztZQUMvQyxNQUFNLFlBQVksR0FBRyx1Q0FBdUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsWUFBWSxVQUFVLFdBQVcsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsRUFBRSxDQUFBO1lBRWxLLCtDQUErQztZQUMvQyxJQUFJLENBQUM7Z0JBQ0QsTUFBTSxRQUFRLEdBQUcsTUFBTSxLQUFLLENBQUMsWUFBWSxFQUFFO29CQUN2QyxNQUFNLEVBQUUsUUFBUTtvQkFDaEIsT0FBTyxFQUFFO3dCQUNMLGFBQWEsRUFBRSxVQUFVLE9BQU8sQ0FBQyxHQUFHLENBQUMsNkJBQTZCLEVBQUU7cUJBQ3ZFO29CQUNELElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO3dCQUNqQixJQUFJLEVBQUUsVUFBVTtxQkFDbkIsQ0FBQztpQkFDTCxDQUFDLENBQUE7Z0JBRUYsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsRUFBRSxRQUFRLENBQUMsQ0FBQTtnQkFFL0MsSUFBSSxJQUFJLEtBQUssU0FBUyxJQUFJLFFBQVEsRUFBRSxVQUFVLEVBQUUsQ0FBQztvQkFDN0MsTUFBTSxnQ0FBZ0MsQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsR0FBRyxXQUFXLFVBQVUsT0FBTyxFQUFFLENBQUMsQ0FBQTtnQkFDMUgsQ0FBQztxQkFBTSxDQUFDO29CQUNKLE1BQU0seUJBQXlCLENBQUMsUUFBUSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLHVCQUF1QixDQUFDLENBQUE7Z0JBQzNHLENBQUM7WUFDTCxDQUFDO1lBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztnQkFDWCxNQUFNLElBQUksbUJBQW1CLENBQUM7b0JBQzFCLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTztvQkFDcEIsTUFBTSxFQUFFLFVBQVU7b0JBQ2xCLFNBQVMsRUFBRSxTQUFTO29CQUNwQixLQUFLLEVBQUU7d0JBQ0gsWUFBWSxFQUFFLDBDQUEwQztxQkFDM0Q7aUJBQ0osQ0FBQyxDQUFBO1lBQ04sQ0FBQztRQUNMLENBQUM7YUFBTSxDQUFDO1lBQ0osTUFBTSxJQUFJLG1CQUFtQixDQUFDO2dCQUMxQixPQUFPLEVBQUUsMEVBQTBFO2dCQUNuRixNQUFNLEVBQUUsVUFBVTtnQkFDbEIsU0FBUyxFQUFFLFNBQVM7Z0JBQ3BCLEtBQUssRUFBRTtvQkFDSCxZQUFZLEVBQUUsNkRBQTZEO2lCQUM5RTthQUNKLENBQUMsQ0FBQTtRQUNOLENBQUM7SUFDTCxDQUFDO1NBQU0sQ0FBQztRQUNKLE1BQU0sSUFBSSxtQkFBbUIsQ0FBQztZQUMxQixPQUFPLEVBQUUsVUFBVSxNQUFNLHFDQUFxQztZQUM5RCxNQUFNLEVBQUUsVUFBVTtZQUNsQixTQUFTLEVBQUUsU0FBUztZQUNwQixLQUFLLEVBQUU7Z0JBQ0gsWUFBWSxFQUFFLDZEQUE2RDthQUM5RTtTQUNKLENBQUMsQ0FBQTtJQUNOLENBQUM7SUFDRCxPQUFPLEVBQUUsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxDQUFBO0FBQ3hGLENBQUMsQ0FBQTtBQUVELE1BQU0sZUFBZSxHQUFHLENBQUMsT0FBaUIsRUFBUyxFQUFFO0lBQ2pELE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDakMsSUFBSSxFQUFFLEdBQUc7UUFDVCxJQUFJLEVBQUUsR0FBRztRQUNULEtBQUssRUFBRSxFQUFFO1FBQ1QsR0FBRyxFQUFFLElBQUk7S0FDWixDQUFDLENBQUMsQ0FBQTtJQUVILE9BQU8sT0FBTyxDQUFBO0FBQ2xCLENBQUMsQ0FBQTtBQUVELE1BQU0sQ0FBQyxNQUFNLGlCQUFpQixHQUFHLEtBQUssRUFBRSxNQUFjLEVBQUUsRUFBRTtJQUN0RCxNQUFNLEdBQUcsR0FBRyxNQUFNLEtBQUssQ0FBQyxxQ0FBcUMsTUFBTSw4QkFBOEIsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsRUFBRSxFQUFFO1FBQ3ZJLE9BQU8sRUFBRTtZQUNMLGFBQWEsRUFBRSxVQUFVLE9BQU8sQ0FBQyxHQUFHLENBQUMsNkJBQTZCLEVBQUU7U0FDdkU7UUFDRCxNQUFNLEVBQUUsS0FBSztLQUNoQixDQUFDLENBQUE7SUFFRixJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQ1YsT0FBTyxDQUFDLEtBQUssQ0FBQywrQkFBK0IsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUE7UUFDOUQsTUFBTSxJQUFJLEtBQUssQ0FBQyw4QkFBOEIsQ0FBQyxDQUFBO0lBQ25ELENBQUM7SUFFRCxNQUFNLElBQUksR0FBRyxNQUFNLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtJQUM3QixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ2pCLE9BQU8sSUFBSSxDQUFBO0FBQ2YsQ0FBQyxDQUFBO0FBRUQsTUFBTSxDQUFDLE1BQU0seUJBQXlCLEdBQUcsS0FBSyxFQUFFLE1BQWUsRUFBRSxFQUFFO0lBQy9ELElBQUksQ0FBQztRQUNELE1BQU0sSUFBSSxHQUFHLE1BQU0saUJBQWlCLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQyxDQUFBO1FBQ2xELE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUE7UUFDeEMsSUFBSSxVQUFVLENBQUE7UUFFZCxJQUFJLGFBQWEsRUFBRSxDQUFDO1lBQ2hCLE9BQU8sQ0FBQyxHQUFHLENBQUMsOEJBQThCLENBQUMsQ0FBQTtZQUMzQyxVQUFVLEdBQUcsZUFBZSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUM5QyxDQUFDO1FBRUQsT0FBTztZQUNILGFBQWEsRUFBRSxhQUFhO1lBQzVCLFVBQVUsRUFBRSxVQUFVO1lBQ3RCLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTTtZQUNuQixNQUFNLEVBQUUsTUFBTTtTQUNqQixDQUFBO0lBQ0wsQ0FBQztJQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDWCxNQUFNLElBQUksbUJBQW1CLENBQUM7WUFDMUIsT0FBTyxFQUFFLGlDQUFpQyxHQUFHLEVBQUU7WUFDL0MsTUFBTSxFQUFFLE1BQU0sSUFBSSxFQUFFO1lBQ3BCLFNBQVMsRUFBRSxTQUFTO1lBQ3BCLEtBQUssRUFBRTtnQkFDSCxZQUFZLEVBQUUsMENBQTBDO2FBQzNEO1NBQ0osQ0FBQyxDQUFBO0lBQ04sQ0FBQztBQUNMLENBQUMsQ0FBQSJ9