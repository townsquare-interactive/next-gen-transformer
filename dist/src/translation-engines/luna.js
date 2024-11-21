import { updatePageList, transformPagesData, createOrEditLayout, deletePages, createGlobalStylesheet } from '../../src/controllers/cms-controller.js';
import { getFileS3, addFileS3 } from '../utilities/s3Functions.js';
import { convertUrlToApexId, setColors, stripImageFolders } from '../utilities/utils.js';
export const transformLuna = async (req) => {
    try {
        //grab url to make S3 folder name
        const cmsUrl = req.body.siteData.config.website.url;
        const basePath = convertUrlToApexId(cmsUrl);
        const themeStyles = setColors(req.body.siteData.design.colors, req.body.siteData.design.themes.selected);
        const assets = [];
        const currentPageList = await getFileS3(`${basePath}/pages/page-list.json`);
        console.log(themeStyles);
        const globalStyles = await createGlobalStylesheet(themeStyles, req.body.siteData.design.fonts, req.body.siteData.design.code, currentPageList, basePath);
        const globalFile = await createOrEditLayout(req.body.siteData, basePath, themeStyles, cmsUrl, globalStyles);
        let newPageList;
        //Transforming and posting saved page data
        let newPageData = {};
        if (req.body.savedData.pages) {
            newPageData = await transformPagesData(req.body.savedData.pages, req.body.siteData.pages, themeStyles, basePath, cmsUrl);
            // update/create pagelist (uses new page )
            newPageList = await updatePageList(newPageData.pages, basePath);
        }
        if (req.body.savedData.favicon) {
            const faviconName = stripImageFolders(req.body.savedData.favicon);
            console.log('favicon time', req.body.siteData.config.website.url + req.body.savedData.favicon, basePath + '/assets/' + faviconName);
            assets.push({ fileName: req.body.siteData.config.website.url + req.body.savedData.favicon, name: faviconName });
        }
        if (req.body.savedData.deletePages) {
            const pageListUrl = `${basePath}/pages/page-list`;
            const updatedPageList = await deletePages(req.body.savedData.deletePages, basePath);
            await addFileS3(updatedPageList, pageListUrl);
        }
        const luna = {
            siteIdentifier: basePath,
            usingPreviewMode: false,
            siteLayout: globalFile,
            pages: newPageData.pages || [],
            assets: assets,
            globalStyles: globalStyles || '',
            siteType: 'full',
        };
        return luna;
    }
    catch (error) {
        console.log(error);
        throw error;
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibHVuYS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90cmFuc2xhdGlvbi1lbmdpbmVzL2x1bmEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGNBQWMsRUFBRSxrQkFBa0IsRUFBRSxrQkFBa0IsRUFBRSxXQUFXLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQTtBQUNySixPQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxNQUFNLDZCQUE2QixDQUFBO0FBQ2xFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxTQUFTLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQTtBQUd4RixNQUFNLENBQUMsTUFBTSxhQUFhLEdBQUcsS0FBSyxFQUFFLEdBQWdCLEVBQUUsRUFBRTtJQUNwRCxJQUFJO1FBQ0EsaUNBQWlDO1FBQ2pDLE1BQU0sTUFBTSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFBO1FBQ25ELE1BQU0sUUFBUSxHQUFHLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQzNDLE1BQU0sV0FBVyxHQUFRLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDN0csTUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFBO1FBQ2pCLE1BQU0sZUFBZSxHQUFHLE1BQU0sU0FBUyxDQUFDLEdBQUcsUUFBUSx1QkFBdUIsQ0FBQyxDQUFBO1FBQzNFLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUE7UUFDeEIsTUFBTSxZQUFZLEdBQUcsTUFBTSxzQkFBc0IsQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRSxRQUFRLENBQUMsQ0FBQTtRQUN4SixNQUFNLFVBQVUsR0FBRyxNQUFNLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLFlBQVksQ0FBQyxDQUFBO1FBQzNHLElBQUksV0FBVyxDQUFBO1FBQ2YsMENBQTBDO1FBQzFDLElBQUksV0FBVyxHQUFRLEVBQUUsQ0FBQTtRQUV6QixJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRTtZQUMxQixXQUFXLEdBQUcsTUFBTSxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUE7WUFFeEgsMENBQTBDO1lBQzFDLFdBQVcsR0FBRyxNQUFNLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFBO1NBQ2xFO1FBRUQsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUU7WUFDNUIsTUFBTSxXQUFXLEdBQUcsaUJBQWlCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUE7WUFDakUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLFFBQVEsR0FBRyxVQUFVLEdBQUcsV0FBVyxDQUFDLENBQUE7WUFDbkksTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLFFBQVEsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUE7U0FDbEg7UUFFRCxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRTtZQUNoQyxNQUFNLFdBQVcsR0FBRyxHQUFHLFFBQVEsa0JBQWtCLENBQUE7WUFDakQsTUFBTSxlQUFlLEdBQUcsTUFBTSxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLFFBQVEsQ0FBQyxDQUFBO1lBQ25GLE1BQU0sU0FBUyxDQUFDLGVBQWUsRUFBRSxXQUFXLENBQUMsQ0FBQTtTQUNoRDtRQUVELE1BQU0sSUFBSSxHQUFHO1lBQ1QsY0FBYyxFQUFFLFFBQVE7WUFDeEIsZ0JBQWdCLEVBQUUsS0FBSztZQUN2QixVQUFVLEVBQUUsVUFBVTtZQUN0QixLQUFLLEVBQUUsV0FBVyxDQUFDLEtBQUssSUFBSSxFQUFFO1lBQzlCLE1BQU0sRUFBRSxNQUFNO1lBQ2QsWUFBWSxFQUFFLFlBQVksSUFBSSxFQUFFO1lBQ2hDLFFBQVEsRUFBRSxNQUFNO1NBQ25CLENBQUE7UUFFRCxPQUFPLElBQUksQ0FBQTtLQUNkO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDWixPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBQ2xCLE1BQU0sS0FBSyxDQUFBO0tBQ2Q7QUFDTCxDQUFDLENBQUEifQ==