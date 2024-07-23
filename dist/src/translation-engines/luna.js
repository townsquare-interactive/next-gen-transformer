import { updatePageList, transformPagesData, createOrEditLayout, deletePages, createGlobalStylesheet } from '../../src/controllers/cms-controller.js';
import { getFileS3, addFileS3 } from '../../src/s3Functions.js';
import { convertUrlToApexId, setColors, stripImageFolders } from '../../src/utils.js';
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
        };
        return luna;
    }
    catch (error) {
        console.log(error);
        throw error;
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibHVuYS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90cmFuc2xhdGlvbi1lbmdpbmVzL2x1bmEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGNBQWMsRUFBRSxrQkFBa0IsRUFBRSxrQkFBa0IsRUFBRSxXQUFXLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQTtBQUNySixPQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxNQUFNLDBCQUEwQixDQUFBO0FBQy9ELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxTQUFTLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQTtBQUdyRixNQUFNLENBQUMsTUFBTSxhQUFhLEdBQUcsS0FBSyxFQUFFLEdBQWdCLEVBQUUsRUFBRTtJQUNwRCxJQUFJLENBQUM7UUFDRCxpQ0FBaUM7UUFDakMsTUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUE7UUFDbkQsTUFBTSxRQUFRLEdBQUcsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUE7UUFDM0MsTUFBTSxXQUFXLEdBQVEsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUM3RyxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUE7UUFDakIsTUFBTSxlQUFlLEdBQUcsTUFBTSxTQUFTLENBQUMsR0FBRyxRQUFRLHVCQUF1QixDQUFDLENBQUE7UUFDM0UsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQTtRQUN4QixNQUFNLFlBQVksR0FBRyxNQUFNLHNCQUFzQixDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEs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