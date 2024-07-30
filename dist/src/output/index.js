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
    if (siteLayout.siteType === 'landing') {
        //zodDataParse<typeof SiteDataSchema, typeof SiteLayout>(siteLayout, SiteDataSchema, 'Site Layout')
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
            //update pagelist
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb3V0cHV0L2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxTQUFTLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQTtBQUNuRSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sa0NBQWtDLENBQUE7QUFFakUsT0FBTyxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQTtBQUMzRSxPQUFPLEVBQUUsZUFBZSxFQUFFLFlBQVksRUFBRSxNQUFNLDJCQUEyQixDQUFBO0FBQ3pFLE9BQU8sRUFBRSxDQUFDLEVBQUUsTUFBTSxLQUFLLENBQUE7QUFDdkIsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGNBQWMsQ0FBQTtBQUU5QyxzREFBc0Q7QUFFdEQsTUFBTSxZQUFZLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFBO0FBRS9CLE1BQU0sQ0FBQyxNQUFNLFFBQVEsR0FBRyxLQUFLLEVBQUUsSUFBaUIsRUFBRSxFQUFFO0lBQ2hELE1BQU0sRUFBRSxjQUFjLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLGdCQUFnQixHQUFHLEtBQUssRUFBRSxHQUFHLElBQUksQ0FBQTtJQUVsRywwRUFBMEU7SUFDMUUsdUVBQXVFO0lBRXZFLGlDQUFpQztJQUNqQyxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLGNBQWMsQ0FBQyxDQUFBO0lBQzdDLFlBQVksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUE7SUFFbEMsSUFBSSxVQUFVLENBQUMsUUFBUSxLQUFLLFNBQVMsRUFBRSxDQUFDO1FBQ3BDLG1HQUFtRztRQUNuRyxZQUFZLENBQUMsVUFBVSxFQUFFLGNBQWMsRUFBRSxhQUFhLENBQUMsQ0FBQTtRQUN2RCxZQUFZLENBQUMsS0FBSyxFQUFFLGNBQWMsRUFBRSxPQUFP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