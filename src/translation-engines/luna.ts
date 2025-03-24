import { updatePageList, transformPagesData, createOrEditLayout, deletePages, createGlobalStylesheet } from '../services/cms-services.js'
import { getFileS3, addFileS3 } from '../../src/utilities/s3Functions.js'
import { convertUrlToApexId, setColors, stripImageFolders } from '../../src/utilities/utils.js'
import { LunaRequest } from '../../types.js'

export const transformLuna = async (req: LunaRequest) => {
    try {
        //grab url to make S3 folder name
        const cmsUrl = req.body.siteData.config.website.url
        const basePath = convertUrlToApexId(cmsUrl)
        const themeStyles: any = setColors(req.body.siteData.design.colors, req.body.siteData.design.themes.selected)
        const assets = []
        const currentPageList = await getFileS3(`${basePath}/pages/page-list.json`)
        console.log(themeStyles)
        const globalStyles = await createGlobalStylesheet(themeStyles, req.body.siteData.design.fonts, req.body.siteData.design.code, currentPageList, basePath)
        const globalFile = await createOrEditLayout(req.body.siteData, basePath, themeStyles, cmsUrl, globalStyles)
        let newPageList
        //Transforming and posting saved page data
        let newPageData: any = {}

        if (req.body.savedData.pages) {
            newPageData = await transformPagesData(req.body.savedData.pages, req.body.siteData.pages, themeStyles, basePath, cmsUrl)

            // update/create pagelist (uses new page )
            newPageList = await updatePageList(newPageData.pages, basePath)
        }

        if (req.body.savedData.favicon) {
            const faviconName = stripImageFolders(req.body.savedData.favicon)
            console.log('favicon time', req.body.siteData.config.website.url + req.body.savedData.favicon, basePath + '/assets/' + faviconName)
            assets.push({ fileName: req.body.siteData.config.website.url + req.body.savedData.favicon, name: faviconName })
        }

        if (req.body.savedData.deletePages) {
            const pageListUrl = `${basePath}/pages/page-list`
            const updatedPageList = await deletePages(req.body.savedData.deletePages, basePath)
            await addFileS3(updatedPageList, pageListUrl)
        }

        const luna = {
            siteIdentifier: basePath,
            usingPreviewMode: false,
            siteLayout: globalFile,
            pages: newPageData.pages || [],
            assets: assets,
            globalStyles: globalStyles || '',
            siteType: 'full',
        }

        return luna
    } catch (error) {
        console.log(error)
        throw error
    }
}
