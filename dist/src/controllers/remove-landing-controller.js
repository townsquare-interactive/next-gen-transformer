import { RemoveLandingPageSchema, RemoveLandingProjectSchema } from '../schema/input-zod.js';
import { zodDataParse } from '../schema/utils-zod.js';
import { SiteDeploymentError } from '../utilities/errors.js';
import { addFileS3, deleteFileS3, deleteFolderS3, getFileS3 } from '../utilities/s3Functions.js';
import { convertUrlToApexId, getPageNameFromDomain } from '../utilities/utils.js';
import { getPageLayoutVars } from './create-site-controller.js';
import { removeDomainFromVercel } from './domain-controller';
export const removeLandingProject = async (req) => {
    const parsedReq = zodDataParse(req, RemoveLandingProjectSchema);
    const apexID = parsedReq.apexID;
    const siteLayout = await getFileS3(`${apexID}/layout.json`, 'site not found in s3');
    console.log('siteLayout:', siteLayout);
    if (typeof siteLayout != 'string') {
        const domains = siteLayout.publishedDomains;
        for (let i = domains.length - 1; i >= 0; i--) {
            console.log('removing domain: ', domains[i]);
            await removeDomainAndS3(domains[i]);
        }
        return {
            message: 'apexID removed sucessfully',
            apexID: apexID,
            status: 'Success',
        };
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
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3ZlLWxhbmRpbmctY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb250cm9sbGVycy9yZW1vdmUtbGFuZGluZy1jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBd0IsdUJBQXVCLEVBQTJCLDBCQUEwQixFQUFFLE1BQU0sd0JBQXdCLENBQUE7QUFFM0ksT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBQ3JELE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBQzVELE9BQU8sRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLGNBQWMsRUFBRSxTQUFTLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQTtBQUNoRyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUscUJBQXFCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQTtBQUNqRixPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQTtBQUMvRCxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQTtBQUU1RCxNQUFNLENBQUMsTUFBTSxvQkFBb0IsR0FBRyxLQUFLLEVBQUUsR0FBNEIsRUFBRSxFQUFFO0lBQ3ZFLE1BQU0sU0FBUyxHQUFHLFlBQVksQ0FBQyxHQUFHLEVBQUUsMEJBQTBCLENBQUMsQ0FBQTtJQUMvRCxNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFBO0lBQy9CLE1BQU0sVUFBVSxHQUFXLE1BQU0sU0FBUyxDQUFDLEdBQUcsTUFBTSxjQUFjLEVBQUUsc0JBQXNCLENBQUMsQ0FBQTtJQUUzRixPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxVQUFVLENBQUMsQ0FBQTtJQUV0QyxJQUFJLE9BQU8sVUFBVSxJQUFJLFFBQVEsRUFBRSxDQUFDO1FBQ2hDLE1BQU0sT0FBTyxHQUFHLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQTtRQUUzQyxLQUFL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