import { updatePageList, transformPagesData, createOrEditLayout, deletePages, createGlobalStylesheet } from '../../src/controllers/cms-controller.js'
import { getFileS3, addFileS3 } from '../../src/s3Functions.js'
import { stripUrl, setColors, stripImageFolders } from '../../src/utils.js'
//import { LunaRequest } from '../../types.js'
import { layout1 } from '../../template1.js'

interface body {
    clientId: string
    type: string
    subdomain: string
    templateIdentifier: string
}

function transformLayoutTemplate(layoutTemplate: any, basePath: string) {
    let siteLayout = layoutTemplate
    siteLayout.s3Folder = basePath
    siteLayout.siteName = basePath
    siteLayout.url = basePath + '.production.townsquareinteractive.com'
    siteLayout.cmsUrl = basePath + '.production.townsquareinteractive.com'

    return siteLayout
}

export const transformCreateSite = async (req: body) => {
    const basePath = req.subdomain

    let siteLayout = transformLayoutTemplate(layout1.layout, basePath)

    try {
        const siteData = {
            siteIdentifier: basePath,
            siteLayout: siteLayout,
            pages: layout1.pages,
            assets: [],
            globalStyles: layout1.globalCSS,
        }

        return siteData
    } catch (error) {
        console.log(error)
        return { error: 'Create site transformer error' }
    }
}
