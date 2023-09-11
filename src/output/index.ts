import { addAssetFromSiteToS3, addFileS3, moveAllS3Objs } from '../s3Functions.js'
import { updatePageList } from '../controllers/cms-controller.js'
import { PublishData } from '../../types.js'

//import { PublishData } from '../../types'
export const publish = async (data: PublishData) => {
    const { siteIdentifier, siteLayout, pages, assets, globalStyles, usingPreviewMode } = data

    const s3SitePath = usingPreviewMode ? siteIdentifier + '/preview' : siteIdentifier

    await addFileS3(siteLayout, `${s3SitePath}/layout`)

    const pageList = []

    if (pages && pages?.length != 0) {
        //adding each page to s3
        for (let i = 0; i < pages.length; i++) {
            console.log('page posting', `${s3SitePath}/pages/${pages[i].data.slug}`)
            //rewrite page list every time to passed page
            pageList.push({ name: pages[i].data.title, slug: pages[i].data.slug, url: pages[i].data.url, id: pages[i].data.id })
            await addFileS3(pages[i], `${s3SitePath}/pages/${pages[i].data.slug}`)
        }
        let newPageList
        //update pagelist
        newPageList = await updatePageList(pages, s3SitePath)
    } else {
        console.log('no pages to add')
    }

    //await addFileS3({ pages: pageList }, `${s3SitePath}/pages/page-list`)

    if (assets && assets?.length != 0) {
        assets.forEach(async (asset) => {
            await addAssetFromSiteToS3(asset.content, s3SitePath + '/assets/' + asset.name)
        })
    }

    await addFileS3(globalStyles, `${s3SitePath}/global`, 'css')
}
