import { updatePageList, transformPagesData, createOrEditLayout, deletePages, createGlobalStylesheet } from '../src/controllers/cms-controller.js';
import { addAssetFromSiteToS3, getFileS3, addMultipleS3, addFileS3 } from '../src/s3Functions.js';
import { stripUrl, setColors, stripImageFolders } from '../src/utils.js';
import engines from '../src/translation-engines/basic.js';
import { transformStrapi } from '../src/translation-engines/strapi.js';
import { publish } from '../src/output/index.js';
import express from 'express';
const router = express.Router();
//chnage to save data
router.post('/save', async (req, res) => {
    try {
        //grab url to make S3 folder name
        const url = req.body.siteData.config.website.url;
        const basePath = stripUrl(url);
        const themeStyles = setColors(req.body.siteData.design.colors, req.body.siteData.design.themes.selected);
        let globalFile;
        globalFile = await createOrEditLayout(req.body.siteData, basePath, themeStyles, url);
        await addFileS3(globalFile, `${basePath}/layout`);
        let newPageList;
        //Transforming and posting saved page data
        if (req.body.savedData.pages) {
            const newPageData = await transformPagesData(req.body.savedData.pages, req.body.siteData.pages, themeStyles, basePath);
            //adding each page to s3 (may need to move to controller)
            for (let i = 0; i < newPageData.pages.length; i++) {
                await addFileS3(newPageData.pages[i], `${basePath}/pages/${newPageData.pages[i].data.slug}`);
            }
            // update/create pagelist (uses new page )
            newPageList = await updatePageList(newPageData.pages, basePath);
        }
        if (req.body.savedData.favicon && req.body.savedData.favicon.src != null) {
            const faviconName = stripImageFolders(req.body.savedData.favicon);
            await addAssetFromSiteToS3(req.body.siteData.config.website.url + req.body.savedData.favicon, basePath + '/assets/' + faviconName);
        }
        if (req.body.savedData.deletePages) {
            const pageListUrl = `${basePath}/pages/page-list`;
            const updatedPageList = await deletePages(req.body.savedData.deletePages, basePath);
            await addFileS3(updatedPageList, pageListUrl);
        }
        if (req.body.savedData.colors || req.body.savedData.fonts || req.body.savedData.code || req.body.savedData.pages) {
            const currentPageList = await getFileS3(`${basePath}/pages/page-list.json`, 'json');
            const globalStyles = await createGlobalStylesheet(themeStyles, req.body.siteData.design.fonts, req.body.siteData.design.code, currentPageList, basePath);
            await addFileS3(globalStyles, `${basePath}/global`, 'css');
        }
        //Adding new siteData file after saving
        await addFileS3(req.body.siteData, `${basePath}/siteData`);
        res.json('posting to s3 folder: ' + basePath);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ err: 'Something went wrong' });
    }
});
router.post('/site-data/basic', async (req, res) => {
    try {
        //siteIdentifier, themeStyles, siteLayout, pages, assets, globalStyles
        const data = engines.basic.translate();
        await publish({ ...data });
        res.json('posting to s3 folder: ' + 'basic');
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ err: 'Something went wrong' });
    }
});
router.post('/site-data/strapi', async (req, res) => {
    //console.log('posted to strapi', req)
    const siteIdentifier = 'csutest0216basic2';
    const teamId = process.env.NEXT_PUBLIC_VERCEL_TEAM_ID;
    const tokey = process.env.NEXT_PUBLIC_VERCEL_AUTH_TOKEN;
    /*     const requeststuff = {
        body: {
            name: siteIdentifier,
            environmentVariables: [
                {
                    key: 'CMS_PUBLIC_URL',
                    target: ['production', 'preview', 'development'],
                    type: 'plain',
                    value: siteIdentifier,
                },
            ],
            framework: 'nextjs',
            gitRepository: {
                repo: 'jedwards4044/next-website',
                type: 'github',
            },
        },
    }

    console.log(JSON.stringify(requeststuff)) */
    /*  //DEPLOYS NEW PROJECT TO VERCEL
    try {
        const rawResponse = await fetch(`https://api.vercel.com/v9/projects?teamId=${teamId}`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${tokey}`,
            },
            body: JSON.stringify(requeststuff.body),
        })
        console.log(rawResponse)
    } catch (err) {
        console.log('EERRRRROR', err)
    } */
    /*  const newDeploy = await fetch(`https://api.vercel.com/v1/projects/{projectID}/deployments`, {
        body: {
            name: 'My Deployment',
            files: [
                {
                    file: '/path/to/file',
                    data: 'BASE64_ENCODED_CONTENT',
                },
            ],
        },
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokey}`,
        },
        method: 'post',
    }) */
    try {
        //siteIdentifier, themeStyles, siteLayout, pages, assets, globalStyles
        const data = await transformStrapi(req.body);
        console.log(data.pages);
        await publish({ ...data });
        res.json('posting to s3 folder: ' + 'strapi');
        // await publish({ ...data })
        //res.json('posting to s3 folder: ' + 'basic')
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ err: 'Something went wrong' });
    }
});
//Saving layout file for nav in header/footer
router.post('/cmsconfig', async (req, res) => {
    const basePath = stripUrl(req.body.config.website.url);
    try {
        const globalFile = await createOrEditLayout(req.body, basePath);
        await addFileS3(globalFile, `${basePath}/layout`);
        res.json(globalFile);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ err: 'Something went wrong' });
    }
});
//save all of site data in one file to s3
router.post('/cms', async (req, res) => {
    const basePath = stripUrl(req.body.config.website.url);
    try {
        await addFileS3(req.body, `${basePath}/siteData`);
        res.json('cms data added');
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ err: 'Something went wrong' });
    }
});
//takes all site data and adds pages using backup data
/* router.post('/migrate', async (req, res) => {
    const newData = transformCMSData(req.body)
    const basePath = stripUrl(req.body.config.website.url)

    try {
        await addMultipleS3(newData.data, newData.pageList, basePath)
        res.json('All Files added')
    } catch (err) {
        console.error(err)
        res.status(500).json({ err: 'Something went wrong' })
    }
}) */
export default router;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY21zLXJvdXRlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2FwaS9jbXMtcm91dGVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxjQUFjLEVBQUUsa0JBQWtCLEVBQUUsa0JBQWtCLEVBQUUsV0FBVyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sc0NBQXNDLENBQUE7QUFFbEosT0FBTyxFQUFFLG9CQUFvQixFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQUUsU0FBUyxFQUFFLE1BQU0sdUJBQXVCLENBQUE7QUFFakcsT0FBTyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQTtBQUV4RSxPQUFPLE9BQU8sTUFBTSxxQ0FBcUMsQ0FBQTtBQUN6RCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sc0NBQXNDLENBQUE7QUFFdEUsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBRWhELE9BQU8sT0FBTyxNQUFNLFNBQVMsQ0FBQTtBQUM3QixNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUE7QUFFL0IscUJBQXFCO0FBQ3JCLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUU7SUFDcEMsSUFBSTtRQUNBLGlDQUFpQztRQUNqQyxNQUFNLEdBQUcsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQTtRQUNoRCxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUE7UUFFOUIsTUFBTSxXQUFXLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FB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