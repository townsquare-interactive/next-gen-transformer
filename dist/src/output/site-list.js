import { addFileS3, getFileS3 } from '../s3Functions.js';
//add created site params to list in s3
export const addToSiteList = async (websiteData) => {
    const basePath = websiteData.subdomain;
    const currentSiteList = await getFileS3(`sites/site-list.json`, []);
    console.log('current site list', currentSiteList);
    if (currentSiteList.filter((site) => site.subdomain === basePath).length <= 0) {
        currentSiteList.push(websiteData);
        console.log('new site list', currentSiteList);
    }
    await addFileS3(currentSiteList, `sites/site-list`);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2l0ZS1saXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL291dHB1dC9zaXRlLWxpc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQTtBQUV4RCx1Q0FBdUM7QUFDdkMsTUFBTSxDQUFDLE1BQU0sYUFBYSxHQUFHLEtBQUssRUFBRSxXQUE2QixFQUFFLEVBQUU7SUFDakUsTUFBTSxRQUFRLEdBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQTtJQUN0QyxNQUFNLGVBQWUsR0FBdUIsTUFBTSxTQUFTLENBQUMsc0JBQXNCLEVBQUUsRUFBRSxDQUFDLENBQUE7SUFDdkYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxlQUFlLENBQUMsQ0FBQTtJQUVqRCxJQUFJLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLEtBQUssUUFBUSxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtRQUMzRSxlQUFlLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFBO1FBQ2pDLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLGVBQWUsQ0FBQyxDQUFBO0tBQ2hEO0lBRUQsTUFBTSxTQUFTLENBQUMsZUFBZSxFQUFFLGlCQUFpQixDQUFDLENBQUE7QUFDdkQsQ0FBQyxDQUFBIn0=