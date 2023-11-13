//import { LunaRequest } from '../../types.js'
import { layout1 } from '../../template1.js';
function transformLayoutTemplate(layoutTemplate, basePath) {
    let siteLayout = layoutTemplate;
    siteLayout.s3Folder = basePath;
    siteLayout.siteName = basePath;
    siteLayout.url = basePath + '.production.townsquareinteractive.com';
    siteLayout.cmsUrl = basePath + '.production.townsquareinteractive.com';
    return siteLayout;
}
export const transformCreateSite = async (req) => {
    const basePath = req.subdomain;
    let siteLayout = transformLayoutTemplate(layout1.layout, basePath);
    try {
        const siteData = {
            siteIdentifier: basePath,
            siteLayout: siteLayout,
            pages: layout1.pages,
            assets: [],
            globalStyles: layout1.globalCSS,
        };
        return siteData;
    }
    catch (error) {
        console.log(error);
        return { error: 'Create site transformer error' };
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLXNpdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdHJhbnNsYXRpb24tZW5naW5lcy9jcmVhdGUtc2l0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFHQSw4Q0FBOEM7QUFDOUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLG9CQUFvQixDQUFBO0FBUzVDLFNBQVMsdUJBQXVCLENBQUMsY0FBbUIsRUFBRSxRQUFnQjtJQUNsRSxJQUFJLFVBQVUsR0FBRyxjQUFjLENBQUE7SUFDL0IsVUFBVSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUE7SUFDOUIsVUFBVSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUE7SUFDOUIsVUFBVSxDQUFDLEdBQUcsR0FBRyxRQUFRLEdBQUcsdUNBQXVDLENBQUE7SUFDbkUsVUFBVSxDQUFDLE1BQU0sR0FBRyxRQUFRLEdBQUcsdUNBQXVDLENBQUE7SUFFdEUsT0FBTyxVQUFVLENBQUE7QUFDckIsQ0FBQztBQUVELE1BQU0sQ0FBQyxNQUFNLG1CQUFtQixHQUFHLEtBQUssRUFBRSxHQUFTLEVBQUUsRUFBRTtJQUNuRCxNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFBO0lBRTlCLElBQUksVUFBVSxHQUFHLHVCQUF1QixDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUE7SUFFbEUsSUFBSTtRQUNBLE1BQU0sUUFBUSxHQUFHO1lBQ2IsY0FBYyxFQUFFLFFBQVE7WUFDeEIsVUFBVSxFQUFFLFVBQVU7WUFDdEIsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLO1lBQ3BCLE1BQU0sRUFBRSxFQUFFO1lBQ1YsWUFBWSxFQUFFLE9BQU8sQ0FBQyxTQUFTO1NBQ2xDLENBQUE7UUFFRCxPQUFPLFFBQVEsQ0FBQTtLQUNsQjtJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ1osT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUNsQixPQUFPLEVBQUUsS0FBSyxFQUFFLCtCQUErQixFQUFFLENBQUE7S0FDcEQ7QUFDTCxDQUFDLENBQUEifQ==