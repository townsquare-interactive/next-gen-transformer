import { RemoveLandingPageSchema, RemoveLandingProjectSchema } from '../schema/input-zod.js';
import { zodDataParse } from '../schema/utils-zod.js';
import { SiteDeploymentError } from '../utilities/errors.js';
import { deleteFolderS3, getFileS3 } from '../utilities/s3Functions.js';
import { convertUrlToApexId } from '../utilities/utils.js';
import { removeDomainFromVercel } from './create-site-controller.js';
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
    return removeDomainAndS3(domain);
};
export const removeDomainAndS3 = async (domain) => {
    const apexID = convertUrlToApexId(domain, false);
    const response = await removeDomainFromVercel(domain);
    await removeSiteFromS3(apexID);
    return response;
};
export const removeSiteFromS3 = async (apexID) => {
    const siteLayout = await getFileS3(`${apexID}/layout.json`, 'site not found in s3');
    if (typeof siteLayout != 'string') {
        //only delete s3 folder if there are no corresponding alt domains
        if (siteLayout.publishedDomains.length < 1) {
            await deleteFolderS3(apexID);
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
            const originalApexFolder = await getFileS3(`${redirectFile.apexId}/layout.json`, 'site not found in s3');
            if (typeof originalApexFolder != 'string' && originalApexFolder.publishedDomains.length < 1) {
                await deleteFolderS3(redirectFile.apexId);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3ZlLWxhbmRpbmctY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb250cm9sbGVycy9yZW1vdmUtbGFuZGluZy1jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBd0IsdUJBQXVCLEVBQTJCLDBCQUEwQixFQUFFLE1BQU0sd0JBQXdCLENBQUE7QUFDM0ksT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBQ3JELE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBQzVELE9BQU8sRUFBRSxjQUFjLEVBQUUsU0FBUyxFQUFFLE1BQU0sNkJBQTZCLENBQUE7QUFDdkUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sdUJBQXVCLENBQUE7QUFDMUQsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sNkJBQTZCLENBQUE7QUFFcEUsTUFBTSxDQUFDLE1BQU0sb0JBQW9CLEdBQUcsS0FBSyxFQUFFLEdBQTRCLEVBQUUsRUFBRTtJQUN2RSxNQUFNLFNBQVMsR0FBRyxZQUFZLENBQUMsR0FBRyxFQUFFLDBCQUEwQixDQUFDLENBQUE7SUFDL0QsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQTtJQUMvQixNQUFNLFVBQVUsR0FBVyxNQUFNLFNBQVMsQ0FBQyxHQUFHLE1BQU0sY0FBYyxFQUFFLHNCQUFzQixDQUFDLENBQUE7SUFFM0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsVUFBVSxDQUFDLENBQUE7SUFFdEMsSUFBSSxPQUFPLFVBQVUsSUFBSSxRQUFRLEVBQUUsQ0FBQztRQUNoQyxNQUFNLE9BQU8sR0FBRyxVQUFVLENBQUMsZ0JBQWdCLENBQUE7UUFFM0MsS0FBSyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxF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