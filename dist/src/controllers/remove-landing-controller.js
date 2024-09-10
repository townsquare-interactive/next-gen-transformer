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
const removeSiteFromS3 = async (apexID) => {
    const siteLayout = await getFileS3(`${apexID}/layout.json`, 'site not found in s3');
    console.log('apexid1', apexID);
    if (typeof siteLayout != 'string') {
        await deleteFolderS3(apexID);
    }
    else {
        throw new SiteDeploymentError({
            message: `ApexID ${apexID} not found in list of created sites`,
            domain: apexID,
            errorType: 'AMS-006',
            state: {
                domainStatus: 'ApexID not found in list',
            },
        });
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3ZlLWxhbmRpbmctY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb250cm9sbGVycy9yZW1vdmUtbGFuZGluZy1jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBd0IsdUJBQXVCLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQTtBQUN0RixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sd0JBQXdCLENBQUE7QUFDckQsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sd0JBQXdCLENBQUE7QUFDNUQsT0FBTyxFQUFnQixjQUFjLEVBQUUsU0FBUyxFQUFFLE1BQU0sNkJBQTZCLENBQUE7QUFDckYsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sdUJBQXVCLENBQUE7QUFDMUQsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sNkJBQTZCLENBQUE7QUFFcEUsTUFBTSxDQUFDLE1BQU0saUJBQWlCLEdBQUcsS0FBSyxFQUFFLEdBQXlCLEVBQUUsRUFBRTtJQUNqRSxNQUFNLFNBQVMsR0FBRyxZQUFZLENBQUMsR0FBRyxFQUFFLHVCQUF1QixDQUFDLENBQUE7SUFDNUQsTUFBTSxHQUFHLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQTtJQUV6QixNQUFNLE1BQU0sR0FBRyxrQkFBa0IsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUE7SUFDN0MsTUFBTSxRQUFRLEdBQUcsTUFBTSxzQkFBc0IsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUNsRCxNQUFNLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBRTlCLE9BQU8sUUFBUSxDQUFBO0FBQ25CLENBQUMsQ0FBQTtBQUVELE1BQU0sZ0JBQWdCLEdBQUcsS0FBSyxFQUFFLE1BQWMsRUFBRSxFQUFFO0lBQzlDLE1BQU0sVUFBVSxHQUFXLE1BQU0sU0FBUyxDQUFDLEdBQUcsTUFBTSxjQUFjLEVBQUUsc0JBQXNCLENBQUMsQ0FBQTtJQUMzRixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQTtJQUM5QixJQUFJLE9BQU8sVUFBVSxJQUFJLFFBQVEsRUFBRSxDQUFDO1FBQ2hDLE1BQU0sY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ2hDLENBQUM7U0FBTSxDQUFDO1FBQ0osTUFBTSxJQUFJLG1CQUFtQixDQUFDO1lBQzFCLE9BQU8sRUFBRSxVQUFVLE1BQU0scUNBQXFDO1lBQzlELE1BQU0sRUFBRSxNQUFNO1lBQ2QsU0FBUyxFQUFFLFNBQVM7WUFDcEIsS0FBSyxFQUFFO2dCQUNILFlBQVksRUFBRSwwQkFBMEI7YUFDM0M7U0FDSixDQUFDLENBQUE7SUFDTixDQUFDO0FBQ0wsQ0FBQyxDQUFBIn0=