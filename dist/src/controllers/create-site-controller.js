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
                console.log('we have found an alt page');
                //check that domain is the same?
                const altPageFile = await getFileS3(`${apexID}/pages/${pageListFile.pages[i].slug}.json`, 'not found');
                const isPubbedDomainTheSame = altPageFile.publishedDomains.filter((pubDomain) => pubDomain === domainName);
                if (isPubbedDomainTheSame.length > 1) {
                    return true;
                }
            }
        }
    }
    console.log('alt page does not contain same domain', domainName);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLXNpdGUtY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb250cm9sbGVycy9jcmVhdGUtc2l0ZS1jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLE1BQU0sNkJBQTZCLENBQUE7QUFDbEUsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLGtCQUFrQixDQUFBO0FBQ3RDLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHVCQUF1QixDQUFBO0FBRTFELE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBRTVELE1BQU0sQ0FBQyxNQUFNLGlCQUFpQixHQUFHLEtBQUssRUFBRSxNQUFjLEVBQUUsT0FBZSxFQUFFLEVBQUU7SUFDdkUsTUFBTSxXQUFXLEdBQWlCLE1BQU0sU0FBUyxDQUFDLEdBQUcsTUFBTSxVQUFVLE9BQU8sT0FBTyxFQUFFLHNCQUFzQixDQUFDLENBQUE7SUFDNUcsSUFBSSxXQUFXLENBQUMsVUFBVSxFQUFFO1FBQ3hCLE9BQU8sV0FBVyxDQUFDLFVBQVUsQ0FBQTtLQUNoQztTQUFNO1FBQ0gsTUFBTSxVQUFVLEdBQVcsTUFBTSxTQUFTLENBQUMsR0FBRyxNQUFNLGNBQWMsRUFBRSxzQkFBc0IsQ0FBQyxDQUFBO1FBQzNGLElBQUksT0FBTyxVQUFVLElBQUksUUFBUSxFQUFFO1lBQy9CLE9BQU8sVUFBVSxDQUFBO1NBQ3BCO2FBQU07WUFDSCxPQUFPLHNCQUFzQixDQUFBO1NBQ2hDO0tBQ0o7QUFDTCxDQUFDLENBQUE7QUFFRCwwREFBMEQ7QUFDMUQsTUFBTSxDQUFDLE1BQU0sNEJBQTRCLEdBQUcsS0FBSyxFQUFFLE1BQWMsRUFBRSxPQUFlLEVBQUUsVUFBa0IsRUFBRSxFQUFFO0lBQ3RHLE1BQU0sWUFBWSxHQUFpQixNQUFNLFNBQVMsQ0FBQyxHQUFHLE1BQU0sdUJBQXVCLEVBQUUsV0FBVyxDQUFDLENBQUE7SUFFakcsSUFBSSxPQUFPLFlBQVksSUFBSSxRQUFRLEVBQUU7UUFDakMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ2hELElBQUksQ0FBQyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLE9BQU8sQ0FBQyxFQUFFO2dCQUMzQyxPQUFPLENBQUMsR0FBRyxDQUFDLDJCQUEyQixDQUFDLENBQUE7Z0JBRXhDLGdDQUFnQztnQkFDaEMsTUFBTSxXQUFXLEdBQUcsTUFBTSxTQUFTLENBQUMsR0FBRyxNQUFNLFVBQVUsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLE9BQU8sRUFBRSxXQUFXLENBQUMsQ0FBQTtnQkFDdEcsTUFBTSxxQkFBcUIsR0FBRyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsU0FBaUIsRUFBRSxFQUFFLENBQUMsU0FBUyxLQUFLLFVBQVUsQ0FBQyxDQUFBO2dCQUVsSCxJQUFJLHFCQUFxQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7b0JBQ2xDLE9BQU8sSUFBSSxDQUFBO2lCQUNkO2FBQ0o7U0FDSjtLQUNKO0lBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1Q0FBdUMsRUFBRSxVQUFVLENBQUMsQ0FBQTtJQUVoRSxPQUFPLEtBQUssQ0FBQTtBQUNoQixDQUFDLENBQUE7QUFFRCxNQUFNLENBQUMsTUFBTSxrQkFBa0IsR0FBRyxLQUFLLEVBQUUsVUFBa0IsRUFBRSxNQUFjLEVBQUUsT0FBZSxFQUFFLEVBQUU7SUFDNUYsSUFBSSxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsSUFBSSxNQUFNLEVBQUU7UUFDMUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsRUFBRSxVQUFVLENBQUMsQ0FBQTtRQUN2RCxNQUFNLFlBQVksR0FBRztZQUNqQixNQUFNLEVBQUUsTUFBTTtZQUNkLE9BQU8sRUFBRSxPQUFPO1NBQ25CLENBQUE7UUFFRCxNQUFNLFNBQVMsQ0FBQyxZQUFZLEVBQUUsR0FBRyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUE7S0FDOUU7QUFDTCxDQUFDLENBQUE7QUFFRCxNQUFNLENBQUMsTUFBTSw2QkFBNkIsR0FBRyxLQUFLLEVBQUUsU0FBaUIsRUFBRSxNQUFlLEVBQUUsT0FBZSxFQUFFLEVBQUU7SUFDdkcsTUFBTSxjQUFjLEdBQUcsTUFBTSxpQkFBaUIsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUE7SUFFbEUsSUFBSSxPQUFPLGNBQWMsSUFBSSxRQUFRLEVBQUU7UUFDbkMsY0FBYyxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUE7UUFDakMsTUFBTSxTQUFTLENBQUMsY0FBYyxFQUFFLEdBQUcsU0FBUyxTQUFTLENBQUMsQ0FBQTtRQUN0RCxPQUFPLFdBQVcsU0FBUyx5QkFBeUIsQ0FBQTtLQUN2RDtTQUFNO1FBQ0gsT0FBTyxVQUFVLFNBQVMsa0JBQWtCLENBQUE7S0FDL0M7QUFDTCxDQUFDLENBQUE7QUFFRCxNQUFNLENBQUMsTUFBTSxhQUFhLEdBQUcsS0FBSyxJQUFJLEVBQUU7SUFDcEMsTUFBTSxVQUFVLEdBQUcsTUFBTSxTQUFTLENBQUMsb0JBQW9CLEVBQUUsRUFBRSxDQUFDLENBQUE7SUFFNUQsT0FBTyxVQUFVLENBQUE7QUFDckIsQ0FBQyxDQUFBO0FBRUQsTUFBTSxDQUFDLEtBQUssVUFBVSx5QkFBeUIsQ0FBQyxNQUFjO0lBQzFELElBQUk7UUFDQSxNQUFNLFdBQVcsR0FBRyxNQUFNLEdBQUcsQ0FBQSx3Q0FBd0MsTUFBTSxHQUFHLENBQUE7UUFDOUUsTUFBTSxZQUFZLEdBQUcsV0FBVyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFBO1FBQzVELE1BQU0sV0FBVyxHQUFHLFlBQVksS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFBO1FBQ3ZFLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUE7UUFFeEIsT0FBTyxXQUFXLENBQUE7S0FDckI7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNaLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDbEIsTUFBTSxFQUFFLGVBQWUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUE7S0FDdkM7QUFDTCxDQUFDO0FBRUQsTUFBTSxDQUFDLE1BQU0saUJBQWlCLEdBQUcsS0FBSyxFQUFFLE1BQWMsRUFBRSxPQUFlLEVBQUUsSUFBWSxFQUFFLEVBQUU7SUFDckYsSUFBSSxVQUFVLENBQUE7SUFDZCxJQUFJLFFBQVEsQ0FBQTtJQUNaLElBQUksSUFBSSxLQUFLLFNBQVMsSUFBSSxPQUFPLEVBQUU7UUFDL0IsTUFBTSxXQUFXLEdBQWlCLE1BQU0sU0FBUyxDQUFDLEdBQUcsTUFBTSxVQUFVLE9BQU8sT0FBTyxFQUFFLHNCQUFzQixDQUFDLENBQUE7UUFDNUcsUUFBUSxHQUFHLFdBQVcsQ0FBQTtRQUN0QixVQUFVLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQTtLQUNuQztTQUFNO1FBQ0gsVUFBVSxHQUFHLE1BQU0saUJBQWlCLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFBO0tBQ3hEO0lBRUQsT0FBTyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxDQUFBO0FBQ3pELENBQUMsQ0FBQTtBQUVELE1BQU0sQ0FBQyxNQUFNLFdBQVcsR0FBRyxLQUFLLEVBQUUsTUFBYyxFQUFFLEVBQUU7SUFDaEQsTUFBTSxRQUFRLEdBQWlCLE1BQU0sU0FBUyxDQUFDLEdBQUcsTUFBTSx1QkFBdUIsRUFBRSxjQUFjLENBQUMsQ0FBQTtJQUVoRyw2QkFBNkI7SUFDN0IsSUFBSSxPQUFPLFFBQVEsS0FBSyxRQUFRLEVBQUU7UUFDOUIsTUFBTSxJQUFJLG1CQUFtQixDQUFDO1lBQzFCLE9BQU8sRUFBRSxVQUFVLE1BQU0seUNBQXlDO1lBQ2xFLE1BQU0sRUFBRSxNQUFNO1lBQ2QsU0FBUyxFQUFFLFNBQVM7WUFDcEIsS0FBSyxFQUFFO2dCQUNILFlBQVksRUFBRSx1Q0FBdUM7YUFDeEQ7U0FDSixDQUFDLENBQUE7S0FDTDtJQUNELE9BQU8sUUFBUSxDQUFBO0FBQ25CLENBQUMsQ0FBQSJ9