import { addFileS3, getFileS3 } from '../utilities/s3Functions.js';
import { sql } from '@vercel/postgres';
import { convertUrlToApexId } from '../utilities/utils.js';
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
//lets check page-list here
export const checkPageListForDeployements = async (apexID, pageUri, domainName) => {
    const pageListFile = await getFileS3(`${apexID}/pages/page-list.json`, 'not found');
    if (typeof pageListFile != 'string') {
        for (let i = 0; i < pageListFile.pages.length; i++) {
            if (!(pageListFile.pages[i].slug === pageUri)) {
                console.log('we have found an alt page');
                return true;
            }
        }
    }
    console.log('no alt page found');
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
        console.log('slayout', siteLayout);
    }
    else {
        siteLayout = await getPageLayoutVars(apexID, pageUri);
    }
    return { siteLayout: siteLayout, sitePage: sitePage };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLXNpdGUtY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb250cm9sbGVycy9jcmVhdGUtc2l0ZS1jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLE1BQU0sNkJBQTZCLENBQUE7QUFDbEUsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLGtCQUFrQixDQUFBO0FBQ3RDLE9BQU8sRUFBdUIsa0JBQWtCLEVBQThCLE1BQU0sdUJBQXVCLENBQUE7QUFJM0csTUFBTSxDQUFDLE1BQU0saUJBQWlCLEdBQUcsS0FBSyxFQUFFLE1BQWMsRUFBRSxPQUFlLEVBQUUsRUFBRTtJQUN2RSxNQUFNLFdBQVcsR0FBaUIsTUFBTSxTQUFTLENBQUMsR0FBRyxNQUFNLFVBQVUsT0FBTyxPQUFPLEVBQUUsc0JBQXNCLENBQUMsQ0FBQTtJQUM1RyxJQUFJLFdBQVcsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUN6QixPQUFPLFdBQVcsQ0FBQyxVQUFVLENBQUE7SUFDakMsQ0FBQztTQUFNLENBQUM7UUFDSixNQUFNLFVBQVUsR0FBVyxNQUFNLFNBQVMsQ0FBQyxHQUFHLE1BQU0sY0FBYyxFQUFFLHNCQUFzQixDQUFDLENBQUE7UUFDM0YsSUFBSSxPQUFPLFVBQVUsSUFBSSxRQUFRLEVBQUUsQ0FBQztZQUNoQyxPQUFPLFVBQVUsQ0FBQTtRQUNyQixDQUFDO2FBQU0sQ0FBQztZQUNKLE9BQU8sc0JBQXNCLENBQUE7UUFDakMsQ0FBQztJQUNMLENBQUM7QUFDTCxDQUFDLENBQUE7QUFFRCwyQkFBMkI7QUFDM0IsTUFBTSxDQUFDLE1BQU0sNEJBQTRCLEdBQUcsS0FBSyxFQUFFLE1BQWMsRUFBRSxPQUFlLEVBQUUsVUFBa0IsRUFBRSxFQUFFO0lBQ3RHLE1BQU0sWUFBWSxHQUFpQixNQUFNLFNBQVMsQ0FBQyxHQUFHLE1BQU0sdUJBQXVCLEVBQUUsV0FB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