import { layout1, layoutLanding } from '../../templates/template1.js'

interface reqBody {
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

export const transformCreateSite = async (req: reqBody) => {
    const basePath = req.subdomain

    let layout
    switch (req.templateIdentifier) {
        case '1':
            layout = layout1
            break
        case '2':
            layout = layoutLanding
            break
        default:
            layout = layout1
            break
    }

    let siteLayout = transformLayoutTemplate(layout.layout, basePath)

    try {
        const siteData = {
            siteIdentifier: basePath,
            siteLayout: siteLayout,
            pages: layout.pages,
            assets: [],
            globalStyles: layout.layout.styles,
        }

        return siteData
    } catch (error) {
        console.log(error)
        throw { error: 'Create site transformer error' }
    }
}
