import { addAssetFromSiteToS3, addFileS3 } from '../s3Functions.js'
import { updatePageList } from '../controllers/cms-controller.js'
import { PublishData } from '../../types.js'
import { SiteDataSchema, zodDataParse, CMSPagesSchema } from '../../schema/output-zod.js'
import { z } from 'zod'
//import { zodToJsonSchema } from 'zod-to-json-schema'

const stringSchema = z.string()

export const publish = async (data: PublishData) => {
    const { siteIdentifier, siteLayout, pages, assets, globalStyles, usingPreviewMode = false } = data

    //create layout json schema
    //const layoutJsonSchema = zodToJsonSchema(SiteDataSchema, 'layout schema')
    //console.log('json schema', JSON.stringify(layoutJsonSchema))

    //const pagesJsonSchema = zodToJsonSchema(CMSPagesSchema, 'layout schema')
    //console.log('json schema for pages', JSON.stringify(pagesJsonSchema))

    //Use zod to check data for types
    console.log('here is siteid', siteIdentifier)
    stringSchema.parse(siteIdentifier)
    zodDataParse(siteLayout, SiteDataSchema, 'Site Layout')
    zodDataParse(pages, CMSPagesSchema, 'Pages')

    const s3SitePath = usingPreviewMode ? siteIdentifier + '/preview' : siteIdentifier

    await addFileS3(siteLayout, `${s3SitePath}/layout`)

    //const pageList = []
    if (pages && pages?.length != 0) {
        for (let i = 0; i < pages.length; i++) {
            console.log('page posting', `${s3SitePath}/pages/${pages[i].data.slug}`)
            await addFileS3(pages[i], `${s3SitePath}/pages/${pages[i].data.slug}`)
        }
        let newPageList
        //update pagelist
        newPageList = await updatePageList(pages, s3SitePath)
    } else {
        console.log('no pages to add')
    }

    if (assets && assets?.length != 0) {
        assets.forEach(async (asset) => {
            await addAssetFromSiteToS3(asset.fileName, s3SitePath + '/assets/' + asset.name)
        })
    }

    if (globalStyles) {
        await addFileS3(globalStyles, `${s3SitePath}/global`, 'css')
    }
}
