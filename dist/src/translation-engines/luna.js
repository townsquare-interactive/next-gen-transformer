import { updatePageList, transformPagesData, createOrEditLayout, deletePages, createGlobalStylesheet } from '../../src/controllers/cms-controller.js';
import { getFileS3, addFileS3 } from '../../src/s3Functions.js';
import { stripUrl, setColors, stripImageFolders } from '../../src/utils.js';
export const transformLuna = async (req) => {
    try {
        //grab url to make S3 folder name
        const cmsUrl = req.body.siteData.config.website.url;
        const basePath = stripUrl(cmsUrl);
        const themeStyles = setColors(req.body.siteData.design.colors, req.body.siteData.design.themes.selected);
        let globalFile;
        globalFile = await createOrEditLayout(req.body.siteData, basePath, themeStyles, cmsUrl);
        let newPageList;
        //Transforming and posting saved page data
        let newPageData = {};
        let globalStyles;
        if (req.body.savedData.pages) {
            newPageData = await transformPagesData(req.body.savedData.pages, req.body.siteData.pages, themeStyles, basePath, cmsUrl);
            // update/create pagelist (uses new page )
            newPageList = await updatePageList(newPageData.pages, basePath);
        }
        if (req.body.savedData.favicon) {
            const faviconName = stripImageFolders(req.body.savedData.favicon);
            console.log('favicon time', req.body.savedData.favicon, req.body.siteData.config.website.url + req.body.savedData.favicon, basePath + '/assets/' + faviconName);
        }
        if (req.body.savedData.deletePages) {
            const pageListUrl = `${basePath}/pages/page-list`;
            const updatedPageList = await deletePages(req.body.savedData.deletePages, basePath);
            await addFileS3(updatedPageList, pageListUrl);
        }
        if (req.body.savedData.colors || req.body.savedData.fonts || req.body.savedData.code || req.body.savedData.pages) {
            const currentPageList = await getFileS3(`${basePath}/pages/page-list.json`);
            globalStyles = await createGlobalStylesheet(themeStyles, req.body.siteData.design.fonts, req.body.siteData.design.code, currentPageList, basePath);
        }
        const luna = {
            siteIdentifier: basePath,
            usingPreviewMode: false,
            siteLayout: globalFile,
            pages: newPageData.pages || [],
            assets: [],
            globalStyles: globalStyles || '',
        };
        return luna;
    }
    catch (error) {
        console.log(error);
        throw error;
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibHVuYS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90cmFuc2xhdGlvbi1lbmdpbmVzL2x1bmEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGNBQWMsRUFBRSxrQkFBa0IsRUFBRSxrQkFBa0IsRUFBRSxXQUFXLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQTtBQUNySixPQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxNQUFNLDBCQUEwQixDQUFBO0FBQy9ELE9BQU8sRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sb0JBQW9CLENBQUE7QUFHM0UsTUFBTSxDQUFDLE1BQU0sYUFBYSxHQUFHLEtBQUssRUFBRSxHQUFnQixFQUFFLEVBQUU7SUFDcEQsSUFBSTtRQUNBLGlDQUFpQztRQUNqQyxNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQTtRQUNuRCxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUE7UUFDakMsTUFBTSxXQUFXLEdBQVEsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUU3RyxJQUFJLFVBQVUsQ0FBQTtRQUNkLFVBQVUsR0FBRyxNQUFNLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUE7UUFFdkYsSUFBSSxXQUFXLENBQUE7UUFDZiwwQ0FBMEM7UUFDMUMsSUFBSSxXQUFXLEdBQVEsRUFBRSxDQUFBO1FBQ3pCLElBQUksWUFBWSxDQUFBO1FBRWhCLElBQUksR0FB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