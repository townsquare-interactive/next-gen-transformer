import { addFileS3, getFileS3 } from '../utilities/s3Functions.js';
import { sql } from '@vercel/postgres';
import { convertUrlToApexId } from '../utilities/utils.js';
import { SiteDeploymentError } from '../utilities/errors.js';
export const getPageLayoutVars = async (apexID, pageUri) => {
    const landingPage = await getFileS3(`${apexID}/pages/${pageUri}.json`, 'site not found in s3');
    if (landingPage.siteLayout) {
        return landingPage.siteLayout;
    }
    else {
        const siteLayout = await getFileS3(`${apexID}/layout.json`, 'site not found in s3');
        if (typeof siteLayout != 'string') {
            return siteLayout;
        }
        else {
            return 'site not found in s3';
        }
    }
};
//check page list to see if alternate page has same domain
export const checkPageListForDeployements = async (apexID, pageUri, domainName) => {
    const pageListFile = await getFileS3(`${apexID}/pages/page-list.json`, 'not found');
    if (typeof pageListFile != 'string') {
        for (let i = 0; i < pageListFile.pages.length; i++) {
            if (!(pageListFile.pages[i].slug === pageUri)) {
                console.log('we have found an alt page', pageListFile.pages[i].slug);
                //check that domain is the same?
                const altPageFile = await getFileS3(`${apexID}/pages/${pageListFile.pages[i].slug}.json`, 'not found');
                const isPubbedDomainTheSame = altPageFile.siteLayout.publishedDomains.filter((pubDomain) => pubDomain === domainName);
                if (isPubbedDomainTheSame.length >= 1) {
                    return true;
                }
            }
        }
    }
    console.log('alt page does not contain same domain ', domainName);
    return false;
};
export const createRedirectFile = async (domainName, apexID, pageUri) => {
    if (convertUrlToApexId(domainName) != apexID) {
        console.log('creating redirect file for: ', domainName);
        const redirectFile = {
            apexId: apexID,
            pageUri: pageUri,
        };
        await addFileS3(redirectFile, `${convertUrlToApexId(domainName)}/redirect`);
    }
};
export const changePublishStatusInSiteData = async (subdomain, status, pageUri) => {
    const siteLayoutFile = await getPageLayoutVars(subdomain, pageUri);
    if (typeof siteLayoutFile != 'string') {
        siteLayoutFile.published = status;
        await addFileS3(siteLayoutFile, `${subdomain}/layout`);
        return `Domain: ${subdomain} publish status changed`;
    }
    else {
        return `Error: ${subdomain} not found in s3`;
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
export const getPageandLanding = async (apexID, pageUri, type) => {
    let siteLayout;
    let sitePage;
    if (type === 'landing' && pageUri) {
        const landingPage = await getFileS3(`${apexID}/pages/${pageUri}.json`, 'site not found in s3');
        sitePage = landingPage;
        siteLayout = sitePage.siteLayout;
    }
    else {
        siteLayout = await getPageLayoutVars(apexID, pageUri);
    }
    return { siteLayout: siteLayout, sitePage: sitePage };
};
export const getPageList = async (apexID) => {
    const pageList = await getFileS3(`${apexID}/pages/page-list.json`, 'no page list');
    //check that page list exists
    if (typeof pageList === 'string') {
        throw new SiteDeploymentError({
            message: `ApexID ${apexID} not found in list of client site files`,
            domain: apexID,
            errorType: 'AMS-006',
            state: {
                domainStatus: 'ApexID not found, project not removed',
            },
        });
    }
    return pageList;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLXNpdGUtY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb250cm9sbGVycy9jcmVhdGUtc2l0ZS1jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLE1BQU0sNkJBQTZCLENBQUE7QUFDbEUsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLGtCQUFrQixDQUFBO0FBQ3RDLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHVCQUF1QixDQUFBO0FBRTFELE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBRTVELE1BQU0sQ0FBQyxNQUFNLGlCQUFpQixHQUFHLEtBQUssRUFBRSxNQUFjLEVBQUUsT0FBZSxFQUFFLEVBQUU7SUFDdkUsTUFBTSxXQUFXLEdBQWlCLE1BQU0sU0FBUyxDQUFDLEdBQUcsTUFBTSxVQUFVLE9BQU8sT0FBTyxFQUFFLHNCQUFzQixDQUFDLENBQUE7SUFDNUcsSUFBSSxXQUFXLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDekIsT0FBTyxXQUFXLENBQUMsVUFBVSxDQUFBO0lBQ2pDLENBQUM7U0FBTSxDQUFDO1FBQ0osTUFBTSxVQUFVLEdBQVcsTUFBTSxTQUFTLENBQUMsR0FBRyxNQUFNLGNBQWMsRUFBRSxzQkFBc0IsQ0FBQyxDQUFBO1FBQzNGLElBQUksT0FBTyxVQUFVLElBQUksUUFBUSxFQUFFLENBQUM7WUFDaEMsT0FBTyxVQUFVLENBQUE7UUFDckIsQ0FBQzthQUFNLENBQUM7WUFDSixPQUFPLHNCQUFzQixDQUFBO1FBQ2pDLENBQUM7SUFDTCxDQUFDO0FBQ0wsQ0FBQyxDQUFBO0FBRUQsMERBQTBEO0FBQzFELE1BQU0sQ0FBQyxNQUFNLDRCQUE0QixHQUFHLEtBQUssRUFBRSxNQUFjLEVBQUUsT0FBZSxFQUFFLFVBQWtCLEVBQUUsRUFBRTtJQUN0RyxNQUFNLFlBQVksR0FB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