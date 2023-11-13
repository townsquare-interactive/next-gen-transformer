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
        /*    await addFileS3(globalFile, `${basePath}/layout`) */
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
            globalStyles: globalStyles,
        };
        return luna;
    }
    catch (error) {
        console.log(error);
        return { error: 'Luna transformer error' };
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibHVuYS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90cmFuc2xhdGlvbi1lbmdpbmVzL2x1bmEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGNBQWMsRUFBRSxrQkFBa0IsRUFBRSxrQkFBa0IsRUFBRSxXQUFXLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQTtBQUNySixPQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxNQUFNLDBCQUEwQixDQUFBO0FBQy9ELE9BQU8sRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sb0JBQW9CLENBQUE7QUFHM0UsTUFBTSxDQUFDLE1BQU0sYUFBYSxHQUFHLEtBQUssRUFBRSxHQUFnQixFQUFFLEVBQUU7SUFDcEQsSUFBSTtRQUNBLGlDQUFpQztRQUNqQyxNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQTtRQUNuRCxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUE7UUFDakMsTUFBTSxXQUFXLEdBQVEsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUU3RyxJQUFJLFVBQVUsQ0FBQTtRQUNkLFVBQVUsR0FBRyxNQUFNLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUE7UUFDdkYsMERBQTBEO1FBRTFELElBQUksV0FBVyxDQUFBO1FBQ2YsMENBQTBDO1FBQzFDLElBQUksV0FBVyxHQUFRLEVBQUUsQ0FBQTtRQUN6QixJQUFJLFlBQVksQ0FBQTtR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