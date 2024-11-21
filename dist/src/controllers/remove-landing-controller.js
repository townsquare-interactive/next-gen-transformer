import { RemoveLandingPageSchema, RemoveLandingProjectSchema } from '../schema/input-zod.js';
import { zodDataParse } from '../schema/utils-zod.js';
import { SiteDeploymentError } from '../utilities/errors.js';
import { addFileS3, deleteFileS3, deleteFolderS3, getFileS3 } from '../utilities/s3Functions.js';
import { convertUrlToApexId, getPageNameFromDomain } from '../utilities/utils.js';
import { getPageLayoutVars, getPageList } from './create-site-controller.js';
import { removeDomainFromVercel } from './domain-controller.js';
export const removeLandingProject = async (req) => {
    const parsedReq = zodDataParse(req, RemoveLandingProjectSchema);
    const apexID = parsedReq.apexID;
    const oldPageList = await getPageList(apexID);
    //need page-list to delete each one
    for (let i = 0; i < oldPageList.pages.length; i++) {
        const pageName = oldPageList.pages[i].slug;
        const siteLayout = await getPageLayoutVars(apexID, pageName);
        console.log('pagename', pageName);
        if (typeof siteLayout != 'string') {
            console.log('we have layout for both');
            const domains = siteLayout.publishedDomains;
            for (let i = domains.length - 1; i >= 0; i--) {
                console.log('removing domain: ', domains[i], pageName);
                await removeDomainAndS3(domains[i], pageName);
            }
        }
        else {
            throw new SiteDeploymentError({
                message: `ApexID ${apexID} not found in list of client site files`,
                domain: apexID,
                errorType: 'AMS-006',
                state: {
                    domainStatus: 'ApexID not found, project not removed',
                },
            });
        }
    }
    return {
        message: 'apexID removed sucessfully',
        apexID: apexID,
        status: 'Success',
    };
};
export const removeLandingSite = async (req) => {
    const parsedReq = zodDataParse(req, RemoveLandingPageSchema);
    const domain = parsedReq.domain;
    const pageUri = getPageNameFromDomain(domain);
    return removeDomainAndS3(domain, pageUri);
};
export const removeDomainAndS3 = async (domain, pageUri = '') => {
    const apexID = convertUrlToApexId(domain, false);
    const domainNoPage = domain.replace(`/${pageUri}`, '');
    const response = await removeDomainFromVercel(domainNoPage, pageUri);
    await removeSiteFromS3(apexID, pageUri);
    return response;
};
export const removeSiteFromS3 = async (apexID, pageUri) => {
    const siteLayout = await getPageLayoutVars(apexID, pageUri);
    if (typeof siteLayout != 'string') {
        //only delete s3 folder if there are no corresponding alt domains
        if (siteLayout.publishedDomains.length < 1) {
            await removeLandingPage(apexID, pageUri);
        }
        else {
            console.log('not deleting s3 file due to other alternate domains existing');
        }
    }
    else {
        //check if redirect file
        const redirectFile = await getFileS3(`${apexID}/redirect.json`, 'site not found in s3');
        if (typeof redirectFile != 'string') {
            await deleteFolderS3(apexID); //delete redirect s3 folder
            //if the original s3 folder after redirect is empty of domains delete it
            const originalSiteLayout = await getPageLayoutVars(redirectFile.apexId, pageUri);
            if (typeof originalSiteLayout != 'string' && originalSiteLayout.publishedDomains.length < 1) {
                await removeLandingPage(redirectFile.apexId, pageUri);
            }
        }
        else {
            throw new SiteDeploymentError({
                message: `ApexID ${apexID} not found in list of created sites during S3 deletion`,
                domain: apexID,
                errorType: 'AMS-006',
                state: {
                    domainStatus: 'ApexID not found in list',
                },
            });
        }
    }
};
// add a function that deletes file then if page-list is empty deletes that
export const removeLandingPage = async (apexID, pageSlug) => {
    await deleteFileS3(`${apexID}/pages/${pageSlug}.json`); //delete page
    //get pagelist
    const oldPageList = await getFileS3(`${apexID}/pages/page-list.json`);
    let newPageList = { pages: [] };
    for (let i = 0; i < oldPageList.pages.length; i++) {
        if (!(oldPageList.pages[i].slug === pageSlug)) {
            newPageList.pages.push(oldPageList.pages[i]);
        }
    }
    if (newPageList.pages.length <= 0) {
        console.log('page-list file now empty');
        await deleteFileS3(`${apexID}/pages/page-list.json`);
    }
    else {
        await addFileS3(newPageList, `${apexID}/pages/page-list`);
    }
    return;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3ZlLWxhbmRpbmctY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb250cm9sbGVycy9yZW1vdmUtbGFuZGluZy1jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBd0IsdUJBQXVCLEVBQTJCLDBCQUEwQixFQUFFLE1BQU0sd0JBQXdCLENBQUE7QUFFM0ksT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBQ3JELE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBQzVELE9BQU8sRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLGNBQWMsRUFBRSxTQUFTLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQTtBQUNoRyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUscUJBQXFCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQTtBQUNqRixPQUFPLEVBQUUsaUJBQWlCLEVBQUUsV0FBVyxFQUFFLE1BQU0sNkJBQTZCLENBQUE7QUFDNUUsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sd0JBQXdCLENBQUE7QUFFL0QsTUFBTSxDQUFDLE1BQU0sb0JBQW9CLEdBQUcsS0FBSyxFQUFFLEdBQTRCLEVBQUUsRUFBRTtJQUN2RSxNQUFNLFNBQVMsR0FBRyxZQUFZLENBQUMsR0FBRyxFQUFFLDBCQUEwQixDQUFDLENBQUE7SUFDL0QsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQTtJQUMvQixNQUFNLFdBQVcsR0FBRyxNQUFNLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUU3QyxtQ0FBbUM7SUFDbkMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQy9DLE1BQU0sUUFBUSxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENB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