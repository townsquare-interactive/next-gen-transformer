import { addAssetFromSiteToS3, addFileS3 } from '../s3Functions.js'
import { updatePageList } from '../controllers/cms-controller.js'
import type { PublishData } from '../../types.js'
import { SiteDataSchema, CMSPagesSchema } from '../../schema/output-zod.js'
import { logZodDataParse, zodDataParse } from '../../schema/utils-zod.js'
import { z } from 'zod'
import { DataUploadError } from '../errors.js'
//import { zodToJsonSchema } from 'zod-to-json-schema'

const stringSchema = z.string()

export const saveToS3 = async (data: PublishData) => {
    const { siteIdentifier, siteLayout, pages, assets, globalStyles, usingPreviewMode = false } = data

    //const pagesJsonSchema = zodToJsonSchema(CMSPagesSchema, 'layout schema')
    //console.log('json schema for pages', JSON.stringify(pagesJsonSchema))

    //Use zod to check data for types
    console.log('here is siteid', siteIdentifier)
    stringSchema.parse(siteIdentifier)

    //Run parsing checks (right now only throws errors when creating landing pages)
    if (siteLayout.siteType === 'landing') {
        zodDataParse(siteLayout, SiteDataSchema, 'Site Layout')
        zodDataParse(pages, CMSPagesSchema, 'Pages')
    } else {
        //log zod parsing errors without disrupting process
        logZodDataParse(siteLayout, SiteDataSchema, 'Site Layout')
        logZodDataParse(pages, CMSPagesSchema, 'Pages')
    }

    try {
        const s3SitePath = usingPreviewMode ? siteIdentifier + '/preview' : siteIdentifier
        await addFileS3(siteLayout, `${s3SitePath}/layout`)

        if (pages && pages?.length != 0) {
            for (let i = 0; i < pages.length; i++) {
                console.log('page posting', `${s3SitePath}/pages/${pages[i].data.slug}`)
                await addFileS3(pages[i], `${s3SitePath}/pages/${pages[i].data.slug}`)
            }

            //update or add pagelist file
            let newPageList
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
            await addFileS3(globalStyles.global + globalStyles.custom, `${s3SitePath}/global`, 'css')
        }

        let domain
        if (siteLayout.siteType === 'landing' && pages && pages?.length > 0) {
            domain = `www.townsquareignite.com/landing/${siteIdentifier}/${pages[0].data.slug}`
        } else {
            domain = `${siteIdentifier}.vercel.app`
        }

        return { message: `site successfully updated`, domain: domain, status: 'Success' }
    } catch (err) {
        throw new DataUploadError({
            message: err.message,
            domain: `${siteIdentifier}.vercel.app`,
            errorType: 'AWS-007',
            state: {
                fileStatus: 'Site S3 files not added and site will not render correctly',
            },
        })
    }
}
