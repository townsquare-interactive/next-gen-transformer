import { layout1 } from '../../templates/template1.js';
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
        throw { error: 'Create site transformer error' };
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLXNpdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdHJhbnNsYXRpb24tZW5naW5lcy9jcmVhdGUtc2l0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sOEJBQThCLENBQUE7QUFTdEQsU0FBUyx1QkFBdUIsQ0FBQyxjQUFtQixFQUFFLFFBQWdCO0lBQ2xFLElBQUksVUFBVSxHQUFHLGNBQWMsQ0FBQTtJQUMvQixVQUFVLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQTtJQUM5QixVQUFVLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQTtJQUM5QixVQUFVLENBQUMsR0FBRyxHQUFHLFFBQVEsR0FBRyx1Q0FBdUMsQ0FBQTtJQUNuRSxVQUFVLENBQUMsTUFBTSxHQUFHLFFBQVEsR0FBRyx1Q0FBdUMsQ0FBQTtJQUV0RSxPQUFPLFVBQVUsQ0FBQTtBQUNyQixDQUFDO0FBRUQsTUFBTSxDQUFDLE1BQU0sbUJBQW1CLEdBQUcsS0FBSyxFQUFFLEdBQVksRUFBRSxFQUFFO0lBQ3RELE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUE7SUFFOUIsSUFBSSxVQUFVLEdBQUcsdUJBQXVCLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQTtJQUVsRSxJQUFJO1FBQ0EsTUFBTSxRQUFRLEdBQUc7WUFDYixjQUFjLEVBQUUsUUFBUTtZQUN4QixVQUFVLEVBQUUsVUFBVTtZQUN0QixLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUs7WUFDcEIsTUFBTSxFQUFFLEVBQUU7WUFDVixZQUFZLEVBQUUsT0FBTyxDQUFDLFNBQVM7U0FDbEMsQ0FBQTtRQUVELE9BQU8sUUFBUSxDQUFBO0tBQ2xCO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDWixPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBQ2xCLE1BQUssRUFBRSxLQUFLLEVBQUUsK0JBQStCLEVBQUUsQ0FBQTtLQUNsRDtBQUNMLENBQUMsQ0FBQSJ9