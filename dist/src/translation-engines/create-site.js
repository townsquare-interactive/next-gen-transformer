import { layout1, layoutLanding } from '../../templates/template1.js';
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
    let layout;
    switch (req.templateIdentifier) {
        case '1':
            layout = layout1;
            break;
        case '2':
            layout = layoutLanding;
            break;
        default:
            layout = layout1;
            break;
    }
    let siteLayout = transformLayoutTemplate(layout.layout, basePath);
    try {
        const siteData = {
            siteIdentifier: basePath,
            siteLayout: siteLayout,
            pages: layout.pages,
            assets: [],
            globalStyles: layout.layout.styles,
        };
        return siteData;
    }
    catch (error) {
        console.log(error);
        throw { error: 'Create site transformer error' };
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLXNpdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdHJhbnNsYXRpb24tZW5naW5lcy9jcmVhdGUtc2l0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDhCQUE4QixDQUFBO0FBU3JFLFNBQVMsdUJBQXVCLENBQUMsY0FBbUIsRUFBRSxRQUFnQjtJQUNsRSxJQUFJLFVBQVUsR0FBRyxjQUFjLENBQUE7SUFDL0IsVUFBVSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUE7SUFDOUIsVUFBVSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUE7SUFDOUIsVUFBVSxDQUFDLEdBQUcsR0FBRyxRQUFRLEdBQUcsdUNBQXVDLENBQUE7SUFDbkUsVUFBVSxDQUFDLE1BQU0sR0FBRyxRQUFRLEdBQUcsdUNBQXVDLENBQUE7SUFFdEUsT0FBTyxVQUFVLENBQUE7QUFDckIsQ0FBQztBQUVELE1BQU0sQ0FBQyxNQUFNLG1CQUFtQixHQUFHLEtBQUssRUFBRSxHQUFZLEVBQUUsRUFBRTtJQUN0RCxNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFBO0lBRTlCLElBQUksTUFBTSxDQUFBO0lBQ1YsUUFBUSxHQUFHLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUM3QixLQUFLLEdBQUc7WUFDSixNQUFNLEdBQUcsT0FBTyxDQUFBO1lBQ2hCLE1BQUs7UUFDVCxLQUFLLEdBQUc7WUFDSixNQUFNLEdBQUcsYUFBYSxDQUFBO1lBQ3RCLE1BQUs7UUFDVDtZQUNJLE1BQU0sR0FBRyxPQUFPLENBQUE7WUFDaEIsTUFBSztJQUNiLENBQUM7SUFFRCxJQUFJLFVBQVUsR0FBRyx1QkFBdUIsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0lBRWpFLElBQUksQ0FBQztRQUNELE1BQU0sUUFBUSxHQUFHO1lBQ2IsY0FBYyxFQUFFLFFBQVE7WUFDeEIsVUFBVSxFQUFFLFVBQVU7WUFDdEIsS0FBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLO1lBQ25CLE1BQU0sRUFBRSxFQUFFO1lBQ1YsWUFBWSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTTtTQUNyQyxDQUFBO1FBRUQsT0FBTyxRQUFRLENBQUE7SUFDbkIsQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDYixPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBQ2xCLE1BQU0sRUFBRSxLQUFLLEVBQUUsK0JBQStCLEVBQUUsQ0FBQTtJQUNwRCxDQUFDO0FBQ0wsQ0FBQyxDQUFBIn0=