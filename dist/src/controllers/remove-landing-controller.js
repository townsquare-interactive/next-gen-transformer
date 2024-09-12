import { RemoveLandingPageSchema } from '../schema/input-zod.js';
import { zodDataParse } from '../schema/utils-zod.js';
import { SiteDeploymentError } from '../utilities/errors.js';
import { deleteFolderS3, getFileS3 } from '../utilities/s3Functions.js';
import { convertUrlToApexId } from '../utilities/utils.js';
import { removeDomainFromVercel } from './create-site-controller.js';
export const removeLandingSite = async (req) => {
    const parsedReq = zodDataParse(req, RemoveLandingPageSchema);
    const url = parsedReq.url;
    const apexID = convertUrlToApexId(url, false);
    const response = await removeDomainFromVercel(url);
    await removeSiteFromS3(apexID);
    return response;
};
export const removeSiteFromS3 = async (apexID) => {
    const siteLayout = await getFileS3(`${apexID}/layout.json`, 'site not found in s3');
    console.log('apexid1', apexID);
    if (typeof siteLayout != 'string') {
        //only delete s3 folder if there are no corresponding alt domains
        if (siteLayout.publishedDomains.length <= 1) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3ZlLWxhbmRpbmctY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb250cm9sbGVycy9yZW1vdmUtbGFuZGluZy1jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBd0IsdUJBQXVCLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQTtBQUN0RixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sd0JBQXdCLENBQUE7QUFDckQsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sd0JBQXdCLENBQUE7QUFDNUQsT0FBTyxFQUFFLGNBQWMsRUFBRSxTQUFTLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQTtBQUN2RSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQTtBQUMxRCxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQTtBQUVwRSxNQUFNLENBQUMsTUFBTSxpQkFBaUIsR0FBRyxLQUFLLEVBQUUsR0FBeUIsRUFBRSxFQUFFO0lBQ2pFLE1BQU0sU0FBUyxHQUFHLFlBQVksQ0FBQyxHQUFHLEVBQUUsdUJBQXVCLENBQUMsQ0FBQTtJQUM1RCxNQUFNLEdBQUcsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFBO0lBQ3pCLE1BQU0sTUFBTSxHQUFHLGtCQUFrQixDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQTtJQUM3QyxNQUFNLFFBQVEsR0FBRyxNQUFNLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQ2xELE1BQU0sZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUE7SUFFOUIsT0FBTyxRQUFRLENBQUE7QUFDbkIsQ0FBQyxDQUFBO0FBRUQsTUFBTSxDQUFDLE1BQU0sZ0JBQWdCLEdBQUcsS0FBSyxFQUFFLE1BQWMsRUFBRSxFQUFFO0lBQ3JELE1BQU0sVUFBVSxHQUFXLE1BQU0sU0FBUyxDQUFDLEdBQUcsTUFBTSxjQUFjLEVBQUUsc0JBQXNCLENBQUMsQ0FBQTtJQUMzRixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQTtJQUM5QixJQUFJLE9BQU8sVUFBVSxJQUFJLFFBQVEsRUFBRSxDQUFDO1FBQ2hDLGlFQUFpRTtRQUNqRSxJQUFJLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDMUMsTUFBTSxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUE7UUFDaEMsQ0FBQzthQUFNLENBQUM7WUFDSixPQUFPLENBQUMsR0FBRyxDQUFDLGdFQUFnRSxDQUFDLENBQUE7UUFDakYsQ0FBQztJQUNMLENBQUM7U0FBTSxDQUFDO1FBQ0osd0JBQXdCO1FBQ3hCLE1BQU0sWUFBWSxHQUF1QixNQUFNLFNBQVMsQ0FBQyxHQUFHLE1BQU0sZ0JBQWdCLEVBQUUsc0JBQXNCLENBQUMsQ0FBQTtRQUMzRyxJQUFJLE9BQU8sWUFBWSxJQUFJLFFBQVEsRUFBRSxDQUFDO1lBQ2xDLE1BQU0sY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFBLENBQUMsMkJBQTJCO1lBRXhELHdFQUF3RTtZQUN4RSxNQUFNLGtCQUFrQixHQUFXLE1BQU0sU0FBUyxDQUFDLEdBQUcsWUFBWSxDQUFDLE1BQU0sY0FBYyxFQUFFLHNCQUFzQixDQUFDLENBQUE7WUFDaEgsSUFBSSxPQUFPLGtCQUFrQixJQUFJLFFBQVEsSUFBSSxrQkFBa0IsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQzFGLE1BQU0sY0FBYyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQTtZQUM3QyxDQUFDO1FBQ0wsQ0FBQzthQUFNLENBQUM7WUFDSixNQUFNLElBQUksbUJBQW1CLENBQUM7Z0JBQzFCLE9BQU8sRUFBRSxVQUFVLE1BQU0sd0RBQXdEO2dCQUNqRixNQUFNLEVBQUUsTUFBTTtnQkFDZCxTQUFTLEVBQUUsU0FBUztnQkFDcEIsS0FBSyxFQUFFO29CQUNILFlBQVksRUFBRSwwQkFBMEI7aUJBQzNDO2FBQ0osQ0FBQyxDQUFBO1FBQ04sQ0FBQztJQUNMLENBQUM7QUFDTCxDQUFDLENBQUEifQ==