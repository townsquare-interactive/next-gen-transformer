import { addAssetFromSiteToS3, addFileS3 } from '../utilities/s3Functions.js';
import { updatePageList } from '../controllers/cms-controller.js';
import { SiteDataSchema, CMSPagesSchema } from '../schema/output-zod.js';
import { logZodDataParse, zodDataParse } from '../schema/utils-zod.js';
import { z } from 'zod';
import { DataUploadError } from '../utilities/errors.js';
//import { zodToJsonSchema } from 'zod-to-json-schema'
const stringSchema = z.string();
export const saveToS3 = async (data) => {
    const { siteIdentifier, siteLayout, pages, assets, globalStyles, usingPreviewMode = false, siteType } = data;
    //const pagesJsonSchema = zodToJsonSchema(CMSPagesArray, 'layout schema')
    //console.log('json schema for pages', JSON.stringify(pagesJsonSchema))
    //Use zod to check data for types
    console.log('here is siteid', siteIdentifier);
    stringSchema.parse(siteIdentifier);
    //Run parsing checks (right now only throws errors when creating landing pages)
    if (siteType === 'landing') {
        //zodDataParse(siteLayout, SiteDataSchema, 'Site Layout')
        zodDataParse(pages, CMSPagesSchema, 'Pages');
    }
    else {
        //log zod parsing errors without disrupting process
        logZodDataParse(siteLayout, SiteDataSchema, 'Site Layout');
        logZodDataParse(pages, CMSPagesSchema, 'Pages');
    }
    try {
        const s3SitePath = usingPreviewMode ? siteIdentifier + '/preview' : siteIdentifier;
        if (siteLayout) {
            await addFileS3(siteLayout, `${s3SitePath}/layout`);
        }
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
        if (siteType === 'landing' && pages && pages?.length > 0) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2F2ZS10by1zMy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vdXRwdXQvc2F2ZS10by1zMy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsU0FBUyxFQUFFLE1BQU0sNkJBQTZCLENBQUE7QUFDN0UsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGtDQUFrQyxDQUFBO0FBRWpFLE9BQU8sRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLE1BQU0seUJBQXlCLENBQUE7QUFDeEUsT0FBTyxFQUFFLGVBQWUsRUFBRSxZQUFZLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQTtBQUN0RSxPQUFPLEVBQUUsQ0FBQyxFQUFFLE1BQU0sS0FBSyxDQUFBO0FBQ3ZCLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQTtBQUN4RCxzREFBc0Q7QUFFdEQsTUFBTSxZQUFZLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFBO0FBRS9CLE1BQU0sQ0FBQyxNQUFNLFFBQVEsR0FBRyxLQUFLLEVBQUUsSUFBaUIsRUFBRSxFQUFFO0lBQ2hELE1BQU0sRUFBRSxjQUFjLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLGdCQUFnQixHQUFHLEtBQUssRUFBRSxRQUFRLEVBQUUsR0FBRyxJQUFJLENBQUE7SUFFNUcseUVBQXlFO0lBQ3pFLHVFQUF1RTtJQUV2RSxpQ0FBaUM7SUFDakMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxjQUFjLENBQUMsQ0FBQTtJQUM3QyxZQUFZLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFBO0lBRWxDLCtFQUErRTtJQUMvRSxJQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUU7UUFDeEIseURBQXlEO1FBQ3pELFlBQVksQ0FBQyxLQUFLLEVBQUUsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFBO0tBQy9DO1NBQU07UUFDSCxtREFB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