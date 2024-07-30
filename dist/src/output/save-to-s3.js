import { addAssetFromSiteToS3, addFileS3 } from '../s3Functions.js';
import { updatePageList } from '../controllers/cms-controller.js';
import { SiteDataSchema, CMSPagesSchema } from '../../schema/output-zod.js';
import { logZodDataParse, zodDataParse } from '../../schema/utils-zod.js';
import { z } from 'zod';
import { DataUploadError } from '../errors.js';
//import { zodToJsonSchema } from 'zod-to-json-schema'
const stringSchema = z.string();
export const saveToS3 = async (data) => {
    const { siteIdentifier, siteLayout, pages, assets, globalStyles, usingPreviewMode = false } = data;
    //const pagesJsonSchema = zodToJsonSchema(CMSPagesSchema, 'layout schema')
    //console.log('json schema for pages', JSON.stringify(pagesJsonSchema))
    //Use zod to check data for types
    console.log('here is siteid', siteIdentifier);
    stringSchema.parse(siteIdentifier);
    //Run parsing checks (right now only throws errors when creating landing pages)
    if (siteLayout.siteType === 'landing') {
        zodDataParse(siteLayout, SiteDataSchema, 'Site Layout');
        zodDataParse(pages, CMSPagesSchema, 'Pages');
    }
    else {
        //log zod parsing errors without disrupting process
        logZodDataParse(siteLayout, SiteDataSchema, 'Site Layout');
        logZodDataParse(pages, CMSPagesSchema, 'Pages');
    }
    try {
        const s3SitePath = usingPreviewMode ? siteIdentifier + '/preview' : siteIdentifier;
        await addFileS3(siteLayout, `${s3SitePath}/layout`);
        if (pages && pages?.length != 0) {
            for (let i = 0; i < pages.length; i++) {
                console.log('page posting', `${s3SitePath}/pages/${pages[i].data.slug}`);
                await addFileS3(pages[i], `${s3SitePath}/pages/${pages[i].data.slug}`);
            }
            //update or add pagelist file
            let newPageList;
            newPageList = await updatePageList(pages, s3SitePath);
        }
        else {
            console.log('no pages to add');
        }
        if (assets && assets?.length != 0) {
            assets.forEach(async (asset) => {
                await addAssetFromSiteToS3(asset.fileName, s3SitePath + '/assets/' + asset.name);
            });
        }
        if (globalStyles) {
            await addFileS3(globalStyles.global + globalStyles.custom, `${s3SitePath}/global`, 'css');
        }
        let domain;
        if (siteLayout.siteType === 'landing' && pages && pages?.length > 0) {
            domain = `www.townsquareignite.com/landing/${siteIdentifier}/${pages[0].data.slug}`;
        }
        else {
            domain = `${siteIdentifier}.vercel.app`;
        }
        return { message: `site successfully updated`, domain: domain, status: 'Success' };
    }
    catch (err) {
        throw new DataUploadError({
            message: err.message,
            domain: `${siteIdentifier}.vercel.app`,
            errorType: 'AWS-007',
            state: {
                fileStatus: 'Site S3 files not added and site will not render correctly',
            },
        });
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2F2ZS10by1zMy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vdXRwdXQvc2F2ZS10by1zMy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsU0FBUyxFQUFFLE1BQU0sbUJBQW1CLENBQUE7QUFDbkUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGtDQUFrQyxDQUFBO0FBRWpFLE9BQU8sRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLE1BQU0sNEJBQTRCLENBQUE7QUFDM0UsT0FBTyxFQUFFLGVBQWUsRUFBRSxZQUFZLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQTtBQUN6RSxPQUFPLEVBQUUsQ0FBQyxFQUFFLE1BQU0sS0FBSyxDQUFBO0FBQ3ZCLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxjQUFjLENBQUE7QUFDOUMsc0RBQXNEO0FBRXRELE1BQU0sWUFBWSxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQTtBQUUvQixNQUFNLENBQUMsTUFBTSxRQUFRLEdBQUcsS0FBSyxFQUFFLElBQWlCLEVBQUUsRUFBRTtJQUNoRCxNQUFNLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxnQkFBZ0IsR0FBRyxLQUFLLEVBQUUsR0FBRyxJQUFJLENBQUE7SUFFbEcsMEVBQTBFO0lBQzFFLHVFQUF1RTtJQUV2RSxpQ0FBaUM7SUFDakMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxjQUFjLENBQUMsQ0FBQTtJQUM3QyxZQUFZLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFBO0lBRWxDLCtFQUErRTtJQUMvRSxJQUFJLFVBQVUsQ0FBQyxRQUFRLEtBQUssU0FBUyxFQUFFLENBQUM7UUFDcEMsWUFBWSxDQUFDLFVBQVUsRUFBRSxjQUFjLEVBQUUsYUFBYSxDQUFDLENBQUE7UUFDdkQsWUFBWSxDQUFDLEtBQUssRUFBRSxjQUFj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