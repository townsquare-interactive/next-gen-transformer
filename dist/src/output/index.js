import { addAssetFromSiteToS3, addFileS3 } from '../s3Functions.js';
import { updatePageList } from '../controllers/cms-controller.js';
import { SiteDataSchema, zodDataParse, CMSPagesSchema } from '../../output-zod.js';
import { z } from 'zod';
//import { zodToJsonSchema } from 'zod-to-json-schema'
const stringSchema = z.string();
export const publish = async (data) => {
    const { siteIdentifier, siteLayout, pages, assets, globalStyles, usingPreviewMode = false } = data;
    //create layout json schema
    //const layoutJsonSchema = zodToJsonSchema(SiteDataSchema, 'layout schema')
    //console.log('json schema', JSON.stringify(layoutJsonSchema))
    //const pagesJsonSchema = zodToJsonSchema(CMSPagesSchema, 'layout schema')
    //console.log('json schema for pages', JSON.stringify(pagesJsonSchema))
    //Use zod to check data for types
    console.log('here is siteid', siteIdentifier);
    stringSchema.parse(siteIdentifier);
    zodDataParse(siteLayout, SiteDataSchema, 'Site Layout');
    zodDataParse(pages, CMSPagesSchema, 'Pages');
    const s3SitePath = usingPreviewMode ? siteIdentifier + '/preview' : siteIdentifier;
    await addFileS3(siteLayout, `${s3SitePath}/layout`);
    //const pageList = []
    if (pages && pages?.length != 0) {
        for (let i = 0; i < pages.length; i++) {
            console.log('page posting', `${s3SitePath}/pages/${pages[i].data.slug}`);
            //rewrite page list every time to passed page
            //pageList.push({ name: pages[i].data.title, slug: pages[i].data.slug, url: pages[i].data.url, id: idString })
            await addFileS3(pages[i], `${s3SitePath}/pages/${pages[i].data.slug}`);
        }
        let newPageList;
        //update pagelist
        newPageList = await updatePageList(pages, s3SitePath);
    }
    else {
        console.log('no pages to add');
    }
    //await addFileS3({ pages: pageList }, `${s3SitePath}/pages/page-list`)
    if (assets && assets?.length != 0) {
        assets.forEach(async (asset) => {
            await addAssetFromSiteToS3(asset.content, s3SitePath + '/assets/' + asset.name);
        });
    }
    if (globalStyles) {
        await addFileS3(globalStyles, `${s3SitePath}/global`, 'css');
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb3V0cHV0L2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxTQUFTLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQTtBQUNuRSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sa0NBQWtDLENBQUE7QUFFakUsT0FBTyxFQUFFLGNBQWMsRUFBRSxZQUFZLEVBQUUsY0FBYyxFQUFFLE1BQU0scUJBQXFCLENBQUE7QUFDbEYsT0FBTyxFQUFFLENBQUMsRUFBRSxNQUFNLEtBQUssQ0FBQTtBQUN2QixzREFBc0Q7QUFFdEQsTUFBTSxZQUFZLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFBO0FBRS9CLE1BQU0sQ0FBQyxNQUFNLE9BQU8sR0FBRyxLQUFLLEVBQUUsSUFBaUIsRUFBRSxFQUFFO0lBQy9DLE1BQU0sRUFBRSxjQUFjLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLGdCQUFnQixHQUFHLEtBQUssRUFBRSxHQUFHLElBQUksQ0FBQTtJQUVsRywyQkFBMkI7SUFDM0IsMkVBQTJFO0lBQzNFLDhEQUE4RDtJQUU5RCwwRUFBMEU7SUFDMUUsdUVBQXVFO0lBRXZFLGlDQUFpQztJQUNqQyxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLGNBQWMsQ0FBQyxDQUFBO0lBQzdDLFlBQVksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUE7SUFDbEMsWUFBWSxDQUFDLFVBQVUsRUFBRSxjQUFjLEVBQUUsYUFBYSxDQUFDLENBQUE7SUFDdkQsWUFBWSxDQUFDLEtBQUssRUFBRSxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUE7SUFFNUMsTUFBTSxVQUFVLEdBQUcsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLGNBQWMsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQTtJQUVsRixNQUFNLFNBQVMsQ0FBQyxVQUFVLEVBQUUsR0FBRyxVQUFVLFNBQVMsQ0FBQyxDQUFBO0lBRW5ELHFCQUFxQjtJQUNyQixJQUFJLEtBQUssSUFBSSxLQUFLLEVBQUUsTUFBTSxJQUFJLENBQUMsRUFBRTtRQUM3QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNuQyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxHQUFHLFVBQVUsVUFBVSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUE7WUFDeEUsNkNBQTZDO1lBQzdDLDhHQUE4RztZQUM5RyxNQUFNLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxVQUFVLFVBQVUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFBO1NBQ3pFO1FBQ0QsSUFBSSxXQUFXLENBQUE7UUFDZixpQkFBaUI7UUFDakIsV0FBVyxHQUFHLE1BQU0sY0FBYyxDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQTtLQUN4RDtTQUFNO1FBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBO0tBQ2pDO0lBRUQsdUVBQXVFO0lBRXZFLElBQUksTUFBTSxJQUFJLE1BQU0sRUFBRSxNQUFNLElBQUksQ0FBQyxFQUFFO1FBQy9CLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFO1lBQzNCLE1BQU0sb0JBQW9CLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxVQUFVLEdBQUcsVUFBVSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUNuRixDQUFDLENBQUMsQ0FBQTtLQUNMO0lBRUQsSUFBSSxZQUFZLEVBQUU7UUFDZCxNQUFNLFNBQVMsQ0FBQyxZQUFZLEVBQUUsR0FBRyxVQUFVLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQTtLQUMvRDtBQUNMLENBQUMsQ0FBQSJ9