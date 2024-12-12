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
                if (altPageFile.siteLayout?.publishedDomains && typeof altPageFile != 'string') {
                    const isPubbedDomainTheSame = altPageFile.siteLayout.publishedDomains?.filter((pubDomain) => pubDomain === domainName);
                    if (isPubbedDomainTheSame.length >= 1) {
                        return true;
                    }
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