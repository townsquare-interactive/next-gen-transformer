import { RemoveLandingPageSchema, RemoveLandingProjectSchema } from '../schema/input-zod.js';
import { zodDataParse } from '../schema/utils-zod.js';
import { SiteDeploymentError } from '../utilities/errors.js';
import { addFileS3, deleteFileS3, deleteFolderS3, getFileS3 } from '../utilities/s3Functions.js';
import { convertUrlToApexId, getPageNameFromDomain } from '../utilities/utils.js';
import { getPageLayoutVars, removeDomainFromVercel } from './create-site-controller.js';
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
    const response = await removeDomainFromVercel(domain);
    await removeSiteFromS3(apexID, pageUri);
    return response;
};
export const removeSiteFromS3 = async (apexID, pageUri) => {
    //const siteLayout: Layout = await getFileS3(`${apexID}/layout.json`, 'site not found in s3')
    const siteLayout = await getPageLayoutVars(apexID, pageUri);
    if (typeof siteLayout != 'string') {
        //only delete s3 folder if there are no corresponding alt domains
        if (siteLayout.publishedDomains.length < 1) {
            //await deleteFolderS3(apexID)
            //deleteFileS3()
            //await deleteFileS3(`${apexID}/pages/${pageUri}.json`)
            await removeLandingPage(apexID, pageUri);
        }
        else {
            console.log('not deleting s3 folder due to other alternate domains existing');
        }
    }
    else {
        //check if redirect file
        const redirectFile = await getFileS3(`${apexID}/redirect.json`, 'site not found in s3');
        if (typeof redirectFile != 'string') {
            await deleteFolderS3(apexID); //delete redirect s3 folder
            //if the original s3 folder after redirect is empty of domains delete it
            //const originalApexFolder: Layout = await getFileS3(`${redirectFile.apexId}/layout.json`, 'site not found in s3')
            const originalSiteLayout = await getPageLayoutVars(redirectFile.apexId, pageUri);
            if (typeof originalSiteLayout != 'string' && originalSiteLayout.publishedDomains.length < 1) {
                await deleteFolderS3(redirectFile.apexId);
                //await deleteFileS3(`${apexID}/pages/${pageUri}.json`)
            }
            await removeLandingPage(redirectFile.apexId, pageUri);
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
const removeLandingPage = async (apexID, pageSlug) => {
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
        await deleteFileS3(`${apexID}/pages/page-list.json`); //delete page
    }
    else {
        await addFileS3(newPageList, `${apexID}/pages/page-list.json`);
    }
    //now add new page-list
    //return newPageList ? { pages: newPageList } : oldPageList
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3ZlLWxhbmRpbmctY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb250cm9sbGVycy9yZW1vdmUtbGFuZGluZy1jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBd0IsdUJBQXVCLEVBQTJCLDBCQUEwQixFQUFFLE1BQU0sd0JBQXdCLENBQUE7QUFFM0ksT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBQ3JELE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBQzVELE9BQU8sRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLGNBQWMsRUFBRSxTQUFTLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQTtBQUNoRyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUscUJBQXFCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQTtBQUVqRixPQUFPLEVBQUUsaUJBQWlCLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQTtBQUV2RixNQUFNLENBQUMsTUFBTSxvQkFBb0IsR0FBRyxLQUFLLEVBQUUsR0FBNEIsRUFBRSxFQUFFO0lBQ3ZFLE1BQU0sU0FBUyxHQUFHLFlBQVksQ0FBQyxHQUFHLEVBQUUsMEJBQTBCLENBQUMsQ0FBQTtJQUMvRCxNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFBO0lBQy9CLE1BQU0sVUFBVSxHQUFXLE1BQU0sU0FBUyxDQUFDLEdBQUcsTUFBTSxjQUFjLEVBQUUsc0JBQXNCLENBQUMsQ0FBQTtJQUUzRixPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxVQUFVLENBQUMsQ0FBQTtJQUV0QyxJQUFJLE9BQU8sVUFBVSxJQUFJLFFBQVEsRUFBRSxDQUFDO1FBQ2hDLE1BQU0sT0FBTyxHQUFHLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQTtRQUUzQyxLQUFLLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUMzQyxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQzVDLE1BQU0saUJBQWlCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDdkMsQ0FBQztRQUVELE9BQU87WUFDSCxPQUFPLEVBQUUsNEJBQTRCO1lBQ3JDLE1BQU0sRUFBRSxNQUFNO1lBQ2QsTUFBTSxFQUFFLFNBQVM7U0FDcEIsQ0FBQTtJQUNMLENBQUM7U0FBTSxDQUFDO1FBQ0osTUFBTSxJQUFJLG1CQUFtQixDQUFDO1lBQzFCLE9BQU8sRUFBRSxVQUFVLE1BQU0seUNBQXlDO1lBQ2xFLE1BQU0sRUFBRSxNQUFNO1lBQ2QsU0FBUyxFQUFFLFNBQVM7WUFDcEIsS0FBSyxFQUFFO2dCQUNILFlBQVksRUFBRSx1Q0FBdUM7YUFDeEQ7U0FDSixDQUFDLENBQUE7SUFDTixDQUFDO0FBQ0wsQ0FBQyxDQUFBO0FBRUQsTUFBTSxDQUFDLE1BQU0saUJBQWlCLEdBQUcsS0FBSyxFQUFFLEdBQXlCLEVBQUUsRUFBRTtJQUNqRSxNQUFNLFNBQVMsR0FBRyxZQUFZLENBQUMsR0FBRyxFQUFFLHVCQUF1QixDQUFDLENBQUE7SUFDNUQsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQTtJQUMvQixNQUFNLE9BQU8sR0FBRyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUM3QyxPQUFPLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQTtBQUM3QyxDQUFDLENBQUE7QUFFRCxNQUFNLENBQUMsTUFBTSxpQkFBaUIsR0FBRyxLQUFLLEVBQUUsTUFBYyxFQUFFLE9BQU8sR0FBRyxFQUFFLEVBQUUsRUFBRTtJQUNwRSxNQUFNLE1BQU0sR0FBRyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUE7SUFDaEQsTUFBTSxRQUFRLEdBQUcsTUFBTSxzQkFBc0IsQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUNyRCxNQUFNLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQTtJQUN2QyxPQUFPLFFBQVEsQ0FBQTtBQUNuQixDQUFDLENBQUE7QUFFRCxNQUFNLENBQUMsTUFBTSxnQkFBZ0IsR0FBRyxLQUFLLEVBQUUsTUFBYyxFQUFFLE9BQWUsRUFBRSxFQUFFO0lBQ3RFLDZGQUE2RjtJQUM3RixNQUFNLFVBQVUsR0FBRyxNQUFNLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQTtJQUUzRCxJQUFJLE9BQU8sVUFBVSxJQUFJLFFBQVEsRUFBRSxDQUFDO1FBQ2hDLGlFQUFpRTtRQUNqRSxJQUFJLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDekMsOEJBQThCO1lBQzlCLGdCQUFnQjtZQUNoQix1REFBdUQ7WUFDdkQsTUFBTSxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUE7UUFDNUMsQ0FBQzthQUFNLENBQUM7WUFDSixPQUFPLENBQUMsR0FBRyxDQUFDLGdFQUFnRSxDQUFDLENBQUE7UUFDakYsQ0FBQztJQUNMLENBQUM7U0FBTSxDQUFDO1FBQ0osd0JBQXdCO1FBQ3hCLE1BQU0sWUFBWSxHQUF1QixNQUFNLFNBQVMsQ0FBQyxHQUFHLE1BQU0sZ0JBQWdCLEVBQUUsc0JBQXNCLENBQUMsQ0FBQTtRQUMzRyxJQUFJLE9BQU8sWUFBWSxJQUFJLFFBQVEsRUFBRSxDQUFDO1lBQ2xDLE1BQU0sY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFBLENBQUMsMkJBQTJCO1lBRXhELHdFQUF3RTtZQUN4RSxrSEFBa0g7WUFDbEgsTUFBTSxrQkFBa0IsR0FBRyxNQUFNLGlCQUFpQixDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUE7WUFDaEYsSUFBSSxPQUFPLGtCQUFrQixJQUFJLFFBQVEsSUFBSSxrQkFBa0IsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQzFGLE1BQU0sY0FBYyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQTtnQkFDekMsdURBQXVEO1lBQzNELENBQUM7WUFDRCxNQUFNLGlCQUFpQixDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUE7UUFDekQsQ0FBQzthQUFNLENBQUM7WUFDSixNQUFNLElBQUksbUJBQW1CLENBQUM7Z0JBQzFCLE9BQU8sRUFBRSxVQUFVLE1BQU0sd0RBQXdEO2dCQUNqRixNQUFNLEVBQUUsTUFBTTtnQkFDZCxTQUFTLEVBQUUsU0FBUztnQkFDcEIsS0FBSyxFQUFFO29CQUNILFlBQVksRUFBRSwwQkFBMEI7aUJBQzNDO2FBQ0osQ0FBQyxDQUFBO1FBQ04sQ0FBQztJQUNMLENBQUM7QUFDTCxDQUFDLENBQUE7QUFFRCwyRUFBMkU7QUFDM0UsTUFBTSxpQkFBaUIsR0FBRyxLQUFLLEVBQUUsTUFBYyxFQUFFLFFBQWdCLEVBQUUsRUFBRTtJQUNqRSxNQUFNLFlBQVksQ0FBQyxHQUFHLE1BQU0sVUFBVSxRQUFRLE9BQU8sQ0FBQyxDQUFBLENBQUMsYUFBYTtJQUVwRSxjQUFjO0lBQ2QsTUFBTSxXQUFXLEdBQWlCLE1BQU0sU0FBUyxDQUFDLEdBQUcsTUFBTSx1QkFBdUIsQ0FBQyxDQUFBO0lBQ25GLElBQUksV0FBVyxHQUFpQixFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsQ0FBQTtJQUU3QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUNoRCxJQUFJLENBQUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxRQUFRLENBQUMsRUFBRSxDQUFDO1lBQzVDLFdBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNoRCxDQUFDO0lBQ0wsQ0FBQztJQUVELElBQUksV0FBVyxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDaEMsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQyxDQUFBO1FBQ3ZDLE1BQU0sWUFBWSxDQUFDLEdBQUcsTUFBTSx1QkFBdUIsQ0FBQyxDQUFBLENBQUMsYUFBYTtJQUN0RSxDQUFDO1NBQU0sQ0FBQztRQUNKLE1BQU0sU0FBUyxDQUFDLFdBQVcsRUFBRSxHQUFHLE1BQU0sdUJBQXVCLENBQUMsQ0FBQTtJQUNsRSxDQUFDO0lBRUQsdUJBQXVCO0lBRXZCLDJEQUEyRDtBQUMvRCxDQUFDLENBQUEifQ==