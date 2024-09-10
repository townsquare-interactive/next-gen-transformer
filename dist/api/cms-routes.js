import { addFileS3, folderExistsInS3, getFileS3 } from '../src/utilities/s3Functions.js';
import { convertUrlToApexId } from '../src/utilities/utils.js';
import { transformStrapi } from '../src/translation-engines/strapi.js';
import { transformLuna } from '../src/translation-engines/luna.js';
import { transformCreateSite } from '../src/translation-engines/create-site.js';
import { saveToS3 } from '../src/output/save-to-s3.js';
import { publishDomainToVercel, changePublishStatusInSiteData, getDomainList, checkIfSiteExistsPostgres, removeDomainFromVercel, } from '../src/controllers/create-site-controller.js';
import { logZodDataParse, zodDataParse } from '../src/schema/utils-zod.js';
import { saveInputSchema, createSiteInputSchema, SubdomainInputSchema } from '../src/schema/input-zod.js';
import express from 'express';
import { validateLandingRequestData } from '../src/controllers/landing-controller.js';
import { handleError } from '../src/utilities/errors.js';
import { createLandingPageFiles } from '../src/translation-engines/landing.js';
import { removeLandingSite } from '../src/controllers/remove-landing-controller.js';
const router = express.Router();
//save from luna cms
router.post('/save', async (req, res) => {
    try {
        //check input data for correct structure
        logZodDataParse(req.body, saveInputSchema, 'savedInput');
        try {
            const url = req.body.siteData.config.website.url;
            const basePath = convertUrlToApexId(url);
            const data = await transformLuna(req);
            await saveToS3({ ...data });
            res.json('posting to s3 folder: ' + basePath);
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ err: 'Something went wrong' });
        }
    }
    catch (err) {
        handleError(err, res);
    }
});
const useDomainPublish = process.env.CREATE_SITE_DOMAINS === '1' ? true : false; //publish new url for each client
router.post('/landing', async (req, res) => {
    try {
        const { apexID, siteData, domainOptions } = validateLandingRequestData(req);
        const data = await createLandingPageFiles(siteData, apexID);
        const s3Res = await saveToS3({ ...data });
        if (useDomainPublish) {
            const response = await publishDomainToVercel(domainOptions, apexID, siteData.pageUri || '');
            console.log(response);
            res.json(response);
        }
        else {
            console.log(s3Res);
            res.json(s3Res);
        }
    }
    catch (err) {
        err.state = { ...err.state, req: req.body };
        handleError(err, res, req.body.url);
    }
});
router.post('/remove-landing', async (req, res) => {
    try {
        const response = await removeLandingSite(req.body);
        res.json(response);
    }
    catch (err) {
        err.state = { ...err.state, req: req.body };
        handleError(err, res, req.body.url);
    }
});
//website data sent for site creation
router.post('/create-site', async (req, res) => {
    try {
        //check input data for correct structure
        zodDataParse(req.body, createSiteInputSchema, 'createSite');
        try {
            //check if site is already created in s3
            const siteExistsInS3 = await folderExistsInS3(req.body.subdomain);
            if (siteExistsInS3) {
                return res.status(500).json('site already exists');
            }
            else {
                //const siteListStatus = await addToSiteList(req.body)
                const data = await transformCreateSite(req.body);
                await saveToS3({ ...data });
                const response = await publishDomainToVercel({ domain: req.body.subdomain, usingPreview: true }, req.body.subdomain);
                console.log('domain status: ', response);
                res.json(' Domain status: ' + response);
            }
        }
        catch (err) {
            console.error(err);
            res.status(500).json(`Domain not able to be created. (Already created or error)`);
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json('incorrect data structure received');
    }
});
//publish site domain to vercel
router.patch('/domain-publish', async (req, res) => {
    try {
        const validatedRequest = zodDataParse(req.body, SubdomainInputSchema, 'input');
        const response = await publishDomainToVercel({ domain: validatedRequest.subdomain, usingPreview: true }, validatedRequest.subdomain);
        console.log(response);
        res.json(response);
    }
    catch (err) {
        handleError(err, res);
    }
});
//remove site domain to vercel
router.patch('/remove-domain', async (req, res) => {
    try {
        const validatedRequest = zodDataParse(req.body, SubdomainInputSchema, 'input');
        const response = await removeDomainFromVercel(validatedRequest.subdomain);
        console.log(response);
        res.json(response);
    }
    catch (err) {
        handleError(err, res);
    }
});
//update publish status for site
router.patch('/publish', async (req, res) => {
    try {
        const validatedRequest = zodDataParse(req.body, SubdomainInputSchema, 'input');
        const response = await changePublishStatusInSiteData(validatedRequest.subdomain, true);
        console.log(response);
        res.json(response);
    }
    catch (err) {
        handleError(err, res);
    }
});
router.patch('/unpublish', async (req, res) => {
    try {
        const validatedRequest = zodDataParse(req.body, SubdomainInputSchema, 'input');
        const response = await changePublishStatusInSiteData(validatedRequest.subdomain, false);
        console.log(response);
        res.json(response);
    }
    catch (err) {
        handleError(err, res);
    }
});
router.get('/get-templates', async (req, res) => {
    try {
        const siteTemplates = await getFileS3(`global-assets/templates/siteTemplates.json`, 'templates not found in s3');
        res.json(siteTemplates);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ err: 'Something went wrong' });
    }
});
//update vercel domain
router.patch('/update-domain', async (req, res) => {
    console.log('redirect', req.body);
    const domainName = req.body.subdomain + '.vercel.app';
    try {
        console.log('starting fetch', domainName);
        const response = await fetch(`https://api.vercel.com/v10/projects/${process.env.VERCEL_PROJECT_ID}/domains/${domainName}?teamId=${process.env.NEXT_PUBLIC_VERCEL_TEAM_ID}`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_VERCEL_AUTH_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                redirect: 'joesburgers.vercel.app', //currently only works with domains on same project
                //redirect: 'google.com',
                redirectStatusCode: 301,
            }),
        });
        console.log(response);
        res.json(response);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong in the transformer' });
    }
});
//save from strapi webhook
router.post('/site-data/strapi', async (req, res) => {
    try {
        const data = await transformStrapi(req.body);
        console.log(data.pages);
        //await publish({ ...data }) //hidden for TS reasons
        res.json('posting to s3 folder: ' + 'strapi');
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ err: 'Something went wrong' });
    }
});
//save all of site data in one file to s3
router.post('/cms', async (req, res) => {
    const basePath = convertUrlToApexId(req.body.config.website.url);
    try {
        await addFileS3(req.body, `${basePath}/siteData`);
        res.json('cms data added');
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ err: 'Something went wrong' });
    }
});
router.get('/domain-list', async (req, res) => {
    try {
        const domainList = await getDomainList();
        res.json(domainList);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ err: 'Something went wrong' });
    }
});
/*-------- Domains ---------------*/
router.post('/domain-check', async (req, res) => {
    const siteStatus = await checkIfSiteExistsPostgres(req.body.domain);
    if (siteStatus === 'site exists') {
        return res.status(500).json({ 'error adding site data': { siteStatus } });
    }
    else {
        return res.status(200).json({ siteStatus });
    }
});
//currently all pages are not passed in save from cms
router.post('/migrate', async (req, res) => {
    try {
        //check input data for correct structure
        zodDataParse(req.body, saveInputSchema, 'savedInput');
        //transform to migrate form
        //move data into pages
        let newPages = {};
        for (let [key, value] of Object.entries(req.body.siteData.pages)) {
            console.log(value);
            let newPage = value;
            if (newPage.publisher) {
                value = { ...newPage, data: newPage.publisher.data };
                newPages = { ...newPages, [key]: value };
            }
        }
        if (req.body.siteData.config.website.favicon.src) {
            req.body.savedData.favicon = req.body.siteData.config.website.favicon.src;
        }
        //change savedData to have all pages
        req.body.savedData = { ...req.body.savedData, pages: newPages };
        try {
            const url = req.body.siteData.config.website.url;
            const basePath = convertUrlToApexId(url);
            const data = await transformLuna(req);
            await saveToS3({ ...data });
            res.json('posting to s3 folder: ' + basePath);
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ err: 'Something went wrong' });
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ err: 'incorrect data structure received' });
    }
});
export default router;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY21zLXJvdXRlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2FwaS9jbXMtcm91dGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQWdCLGdCQUFnQixFQUFFLFNBQVMsRUFBRSxNQUFNLGlDQUFpQyxDQUFBO0FBQ3RHLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDJCQUEyQixDQUFBO0FBQzlELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQTtBQUN0RSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sb0NBQW9DLENBQUE7QUFDbEUsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sMkNBQTJDLENBQUE7QUFDL0UsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLDZCQUE2QixDQUFBO0FBQ3RELE9BQU8sRUFDSCxxQkFBcUIsRUFDckIsNkJBQTZCLEVBQzdCLGFBQWEsRUFDYix5QkFBeUIsRUFDekIsc0JBQXNCLEdBQ3pCLE1BQU0sOENBQThDLENBQUE7QUFDckQsT0FBTyxFQUFFLGVBQWUsRUFBRSxZQUFZLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQTtBQUMxRSxPQUFPLEVBQUUsZUFBZSxFQUFFLHFCQUFxQixFQUFFLG9CQUFvQixFQUFzQixNQUFNLDRCQUE0QixDQUFBO0FBQzdILE9BQU8sT0FBTyxNQUFNLFNBQVMsQ0FBQTtBQUM3QixPQUFPLEVBQUUsMEJBQTBCLEVBQUUsTUFBTSwwQ0FBMEMsQ0FBQTtBQUNyRixPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sNEJBQTRCLENBQUE7QUFDeEQsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sdUNBQXVDLENBQUE7QUFFOUUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0saURBQWlELENBQUE7QUFDbkYsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFBO0FBRS9CLG9CQUFvQjtBQUNwQixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO0lBQ3BDLElBQUksQ0FBQztRQUNELHdDQUF3QztRQUN4QyxlQUFlLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUUsWUFBWSxDQUFDLENBQUE7UUFFeEQsSUFBSSxDQUFDO1lBQ0QsTUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUE7WUFDaEQsTUFBTSxRQUFRLEdBQUcsa0JBQWtCLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDeEMsTUFBTSxJQUFJLEdBQUcsTUFBTSxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDckMsTUFBTSxRQUFRLENBQUMsRUFBRSxHQUFHLElBQUksRUFBRSxDQUFDLENBQUE7WUFFM0IsR0FBRyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsR0FBRyxRQUFRLENBQUMsQ0FBQTtRQUNqRCxDQUFDO1FBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztZQUNYLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDbEIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsc0JBQXNCLEVBQUUsQ0FBQyxDQUFBO1FBQ3pELENBQUM7SUFDTCxDQUFDO0lBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNYLFdBQVcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUE7SUFDekIsQ0FBQztBQUNMLENBQUMsQ0FBQyxDQUFBO0FBRUYsTUFBTSxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUEsQ0FBQyxpQ0FBaUM7QUFDakgsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRTtJQUN2QyxJQUFJLENBQUM7UUFDRCxNQUFNLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUUsR0FBRywwQkFBMEIsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUMzRSxNQUFNLElBQUksR0FBRyxNQUFNLHNCQUFzQixDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQTtRQUMzRCxNQUFNLEtBQUssR0FBRyxNQUFNLFFBQVEsQ0FBQyxFQUFFLEdBQUcsSUFBSSxFQUFFLENBQUMsQ0FBQTtRQUV6QyxJQUFJLGdCQUFnQixFQUFFLENBQUM7WUFDbkIsTUFBTSxRQUFRLEdBQWMsTUFBTSxxQkFBcUIsQ0FBQyxhQUFhLEVBQUUsTUFBTSxFQUFFLFFBQVEsQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDLENBQUE7WUFFdEcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQTtZQUNyQixHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQ3RCLENBQUM7YUFBTSxDQUFDO1lBQ0osT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQTtZQUNsQixHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBQ25CLENBQUM7SUFDTCxDQUFDO0lBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNYLEdBQUcsQ0FBQyxLQUFLLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtRQUMzQyxXQUFXLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQ3ZDLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQTtBQUVGLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRTtJQUM5QyxJQUFJLENBQUM7UUFDRCxNQUFNLFFBQVEsR0FBRyxNQUFNLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUNsRCxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0lBQ3RCLENBQUM7SUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ1gsR0FBRyxDQUFDLEtBQUssR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFBO1FBQzNDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDdkMsQ0FBQztBQUNMLENBQUMsQ0FBQyxDQUFBO0FBRUYscUNBQXFDO0FBQ3JDLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUU7SUFDM0MsSUFBSSxDQUFDO1FBQ0Qsd0NBQXdDO1FBQ3hDLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLHFCQUFxQixFQUFFLFlBQVksQ0FBQyxDQUFBO1FBRTNELElBQUksQ0FBQztZQUNELHdDQUF3QztZQUN4QyxNQUFNLGNBQWMsR0FBRyxNQUFNLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7WUFFakUsSUFBSSxjQUFjLEVBQUUsQ0FBQztnQkFDakIsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFBO1lBQ3RELENBQUM7aUJBQU0sQ0FBQztnQkFDSixzREFBc0Q7Z0JBQ3RELE1BQU0sSUFBSSxHQUFHLE1BQU0sbUJBQW1CLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFBO2dCQUNoRCxNQUFNLFFBQVEsQ0FBQyxFQUFFLEdBQUcsSUFBSSxFQUFFLENBQUMsQ0FBQTtnQkFDM0IsTUFBTSxRQUFRLEdBQUcsTUFBTSxxQkFBcUIsQ0FBQyxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQTtnQkFDcEgsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSxRQUFRLENBQUMsQ0FBQTtnQkFDeEMsR0FBRyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxRQUFRLENBQUMsQ0FBQTtZQUMzQyxDQUFDO1FBQ0wsQ0FBQztRQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7WUFDWCxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ2xCLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLDJEQUEyRCxDQUFDLENBQUE7UUFDckYsQ0FBQztJQUNMLENBQUM7SUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ1gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNoQixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFBO0lBQzdELENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQTtBQUVGLCtCQUErQjtBQUMvQixNQUFNLENBQUMsS0FBSyxDQUFDLGlCQUFpQixFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUU7SUFDL0MsSUFBSSxDQUFDO1FBQ0QsTUFBTSxnQkFBZ0IsR0FBRyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxvQkFBb0IsRUFBRSxPQUFPLENBQUMsQ0FBQTtRQUM5RSxNQUFNLFFBQVEsR0FBRyxNQUFNLHFCQUFxQixDQUFDLEVBQUUsTUFBTSxFQUFFLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLEVBQUUsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUE7UUFDcEksT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUNyQixHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0lBQ3RCLENBQUM7SUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ1gsV0FBVyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQTtJQUN6QixDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUE7QUFFRiw4QkFBOEI7QUFDOUIsTUFBTSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO0lBQzlDLElBQUksQ0FBQztRQUNELE1BQU0sZ0JBQWdCLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsb0JBQW9CLEVBQUUsT0FBTyxDQUFDLENBQUE7UUFDOUUsTUFBTSxRQUFRLEdBQUcsTUFBTSxzQkFBc0IsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQTtRQUN6RSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQ3JCLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDdEIsQ0FBQztJQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDWCxXQUFXLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQ3pCLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQTtBQUVGLGdDQUFnQztBQUNoQyxNQUFNLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO0lBQ3hDLElBQUksQ0FBQztRQUNELE1BQU0sZ0JBQWdCLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsb0JBQW9CLEVBQUUsT0FBTyxDQUFDLENBQUE7UUFDOUUsTUFBTSxRQUFRLEdBQUcsTUFBTSw2QkFBNkIsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUE7UUFDdEYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUNyQixHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0lBQ3RCLENBQUM7SUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ1gsV0FBVyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQTtJQUN6QixDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUE7QUFFRixNQUFNLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO0lBQzFDLElBQUksQ0FBQztRQUNELE1BQU0sZ0JBQWdCLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsb0JBQW9CLEVBQUUsT0FBTyxDQUFDLENBQUE7UUFDOUUsTUFBTSxRQUFRLEdBQUcsTUFBTSw2QkFBNkIsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFDdkYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUNyQixHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0lBQ3RCLENBQUM7SUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ1gsV0FBVyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQTtJQUN6QixDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUE7QUFFRixNQUFNLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUU7SUFDNUMsSUFBSSxDQUFDO1FBQ0QsTUFBTSxhQUFhLEdBQUcsTUFBTSxTQUFTLENBQUMsNENBQTRDLEVBQUUsMkJBQTJCLENBQUMsQ0FBQTtRQUNoSCxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFBO0lBQzNCLENBQUM7SUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ1gsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNsQixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxzQkFBc0IsRUFBRSxDQUFDLENBQUE7SUFDekQsQ0FBQztBQUNMLENBQUMsQ0FBQyxDQUFBO0FBRUYsc0JBQXNCO0FBQ3RCLE1BQU0sQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRTtJQUM5QyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDakMsTUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsYUFBYSxDQUFBO0lBRXJELElBQUksQ0FBQztRQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsVUFBVSxDQUFDLENBQUE7UUFDekMsTUFBTSxRQUFRLEdBQUcsTUFBTSxLQUFLLENBQ3hCLHVDQUF1QyxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixZQUFZLFVBQVUsV0FBVyxPQUFPLENBQUMsR0FBRyxDQUFDLDBCQUEwQixFQUFFLEVBQzdJO1lBQ0ksTUFBTSxFQUFFLE9BQU87WUFDZixPQUFPLEVBQUU7Z0JBQ0wsYUFBYSxFQUFFLFVBQVUsT0FBTyxDQUFDLEdBQUcsQ0FBQyw2QkFBNkIsRUFBRTtnQkFDcEUsY0FBYyxFQUFFLGtCQUFrQjthQUNyQztZQUNELElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO2dCQUNqQixRQUFRLEVBQUUsd0JBQXdCLEVBQUUsbURBQW1EO2dCQUN2Rix5QkFBeUI7Z0JBQ3pCLGtCQUFrQixFQUFFLEdBQUc7YUFDMUIsQ0FBQztTQUNMLENBQ0osQ0FBQTtRQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDckIsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUN0QixDQUFDO0lBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNYLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDbEIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUseUNBQXlDLEVBQUUsQ0FBQyxDQUFBO0lBQzlFLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQTtBQUVGLDBCQUEwQjtBQUMxQixNQUFNLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUU7SUFDaEQsSUFBSSxDQUFDO1FBQ0QsTUFBTSxJQUFJLEdBQUcsTUFBTSxlQUFlLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQzVDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBRXZCLG9EQUFvRDtRQUNwRCxHQUFHLENBQUMsSUFBSSxDQUFDLHdCQUF3QixHQUFHLFFBQVEsQ0FBQyxDQUFBO0lBQ2pELENBQUM7SUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ1gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNoQixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxzQkFBc0IsRUFBRSxDQUFDLENBQUE7SUFDekQsQ0FBQztBQUNMLENBQUMsQ0FBQyxDQUFBO0FBRUYseUNBQXlDO0FBQ3pDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUU7SUFDbkMsTUFBTSxRQUFRLEdBQUcsa0JBQWtCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBRWhFLElBQUksQ0FBQztRQUNELE1BQU0sU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxRQUFRLFdBQVcsQ0FBQyxDQUFBO1FBQ2pELEdBQUcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtJQUM5QixDQUFDO0lBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNYLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDbEIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsc0JBQXNCLEVBQUUsQ0FBQyxDQUFBO0lBQ3pELENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQTtBQUVGLE1BQU0sQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUU7SUFDMUMsSUFBSSxDQUFDO1FBQ0QsTUFBTSxVQUFVLEdBQUcsTUFBTSxhQUFhLEVBQUUsQ0FBQTtRQUN4QyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFBO0lBQ3hCLENBQUM7SUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ1gsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNsQixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxzQkFBc0IsRUFBRSxDQUFDLENBQUE7SUFDekQsQ0FBQztBQUNMLENBQUMsQ0FBQyxDQUFBO0FBRUYsb0NBQW9DO0FBRXBDLE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUU7SUFDNUMsTUFBTSxVQUFVLEdBQUcsTUFBTSx5QkFBeUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ25FLElBQUksVUFBVSxLQUFLLGFBQWEsRUFBRSxDQUFDO1FBQy9CLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSx3QkFBd0IsRUFBRSxFQUFFLFVBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQTtJQUM3RSxDQUFDO1NBQU0sQ0FBQztRQUNKLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFBO0lBQy9DLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQTtBQUVGLHFEQUFxRDtBQUNyRCxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO0lBQ3ZDLElBQUksQ0FBQztRQUNELHdDQUF3QztRQUN4QyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUUsWUFBWSxDQUFDLENBQUE7UUFFckQsMkJBQTJCO1FBQzNCLHNCQUFzQjtRQUN0QixJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUE7UUFDakIsS0FBSyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUMvRCxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFBO1lBQ2xCLElBQUksT0FBTyxHQUFRLEtBQUssQ0FBQTtZQUN4QixJQUFJLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDcEIsS0FBSyxHQUFHLEVBQUUsR0FBRyxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUE7Z0JBQ3BELFFBQVEsR0FBRyxFQUFFLEdBQUcsUUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUE7WUFDNUMsQ0FBQztRQUNMLENBQUM7UUFFRCxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQy9DLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUE7UUFDN0UsQ0FBQztRQUVELG9DQUFvQztRQUNwQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxDQUFBO1FBRS9ELElBQUksQ0FBQztZQUNELE1BQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFBO1lBQ2hELE1BQU0sUUFBUSxHQUFHLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ3hDLE1BQU0sSUFBSSxHQUFHLE1BQU0sYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ3JDLE1BQU0sUUFBUSxDQUFDLEVBQUUsR0FBRyxJQUFJLEVBQUUsQ0FBQyxDQUFBO1lBRTNCLEdBQUcsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLEdBQUcsUUFBUSxDQUFDLENBQUE7UUFDakQsQ0FBQztRQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7WUFDWCxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ2xCLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLHNCQUFzQixFQUFFLENBQUMsQ0FBQTtRQUN6RCxDQUFDO0lBQ0wsQ0FBQztJQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDWCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2hCLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLG1DQUFtQyxFQUFFLENBQUMsQ0FBQTtJQUN0RSxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUE7QUFFRixlQUFlLE1BQU0sQ0FBQSJ9