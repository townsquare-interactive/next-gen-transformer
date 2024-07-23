import { addAssetFromSiteToS3, addFileS3 } from '../s3Functions.js';
import { updatePageList } from '../controllers/cms-controller.js';
import { SiteDataSchema, CMSPagesSchema } from '../../schema/output-zod.js';
import { zodDataParse } from '../../schema/utils-zod.js';
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
    zodDataParse(siteLayout, SiteDataSchema, 'Site Layout', siteLayout.siteType === 'landing' ? 'parse' : 'safeParse');
    zodDataParse(pages, CMSPagesSchema, 'Pages', siteLayout.siteType === 'landing' ? 'parse' : 'safeParse');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb3V0cHV0L2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxTQUFTLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQTtBQUNuRSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sa0NBQWtDLENBQUE7QUFFakUsT0FBTyxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQTtBQUMzRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMkJBQTJCLENBQUE7QUFDeEQsT0FBTyxFQUFFLENBQUMsRUFBRSxNQUFNLEtBQUssQ0FBQTtBQUN2QixPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sY0FBYyxDQUFBO0FBQzlDLHNEQUFzRDtBQUV0RCxNQUFNLFlBQVksR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUE7QUFFL0IsTUFBTSxDQUFDLE1BQU0sUUFBUSxHQUFHLEtBQUssRUFBRSxJQUFpQixFQUFFLEVBQUU7SUFDaEQsTUFBTSxFQUFFLGNBQWMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsZ0JBQWdCLEdBQUcsS0FBSyxFQUFFLEdBQUcsSUFBSSxDQUFBO0lBRWxHLDBFQUEwRTtJQUMxRSx1RUFBdUU7SUFFdkUsaUNBQWlDO0lBQ2pDLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsY0FBYyxDQUFDLENBQUE7SUFDN0MsWUFBWSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQTtJQUNsQyxZQUFZLENBQUMsVUFBVSxFQUFFLGNBQWMsRUFBRSxhQUFhLEVBQUUsVUFBVSxDQUFDLFFBQVEsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUE7SUFDbEgsWUFBWSxDQUFDLEtBQUssRUFBRSxjQUFjLEVBQUUsT0FB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