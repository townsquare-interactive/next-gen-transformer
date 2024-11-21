import { addFileS3, folderExistsInS3, getFileS3 } from '../src/utilities/s3Functions.js';
import { convertUrlToApexId } from '../src/utilities/utils.js';
import { transformStrapi } from '../src/translation-engines/strapi.js';
import { transformLuna } from '../src/translation-engines/luna.js';
import { transformCreateSite } from '../src/translation-engines/create-site.js';
import { saveToS3 } from '../src/output/save-to-s3.js';
import { changePublishStatusInSiteData, getDomainList, checkIfSiteExistsPostgres } from '../src/controllers/create-site-controller.js';
import { logZodDataParse, zodDataParse } from '../src/schema/utils-zod.js';
import { saveInputSchema, createSiteInputSchema, SubdomainInputSchema, RequestDataSchema } from '../src/schema/input-zod.js';
import express from 'express';
import { getRequestData, validateLandingRequestData } from '../src/controllers/landing-controller.js';
import { handleError } from '../src/utilities/errors.js';
import { createLandingPageFiles } from '../src/translation-engines/landing.js';
import { removeLandingProject, removeLandingSite } from '../src/controllers/remove-landing-controller.js';
import { checkDomainConfigOnVercel, publishDomainToVercel, removeDomainFromVercel } from '../src/controllers/domain-controller.js';
import { scrapeImagesFromSite } from '../src/scrapers/image-scrape.js';
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
const useDomainPublish = process.env.CREATE_SITE_DOMAINS === '0' ? false : true; //publish new url for each client
router.post('/landing', async (req, res) => {
    try {
        const { apexID, siteData, domainOptions } = validateLandingRequestData(req);
        const data = await createLandingPageFiles(siteData, apexID);
        const s3Res = await saveToS3({ ...data });
        if (useDomainPublish) {
            const domainResponse = await publishDomainToVercel(domainOptions, apexID, siteData.pageUri || '');
            console.log(domainResponse);
            res.json(domainResponse);
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
router.delete('/landing-domains/:domain', async (req, res) => {
    try {
        const response = await removeLandingSite(req.params);
        res.json(response);
    }
    catch (err) {
        err.state = { ...err.state, req: req.params };
        handleError(err, res, req.params.domain);
    }
});
router.delete('/apexIDs/:apexID', async (req, res) => {
    try {
        const response = await removeLandingProject(req.params);
        res.json(response);
    }
    catch (err) {
        err.state = { ...err.state, req: req.params };
        handleError(err, res, req.params.apexID);
    }
});
router.get('/check-domain-config', async (req, res) => {
    try {
        const domain = req.query.domain || '';
        if (typeof domain !== 'string') {
            return res.status(400).json({ error: 'Invalid domain parameter' });
        }
        const response = await checkDomainConfigOnVercel(domain);
        res.json(response);
    }
    catch (err) {
        err.state = { ...err.state, req: req.body };
        handleError(err, res);
    }
});
//
router.get('/landing-request-data', async (req, res) => {
    try {
        const reqData = zodDataParse(req.query, RequestDataSchema, 'parse');
        const domain = reqData.domain;
        const response = await getRequestData(domain);
        res.json(response);
    }
    catch (err) {
        err.state = { ...err.state, req: req.body };
        handleError(err, res);
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
        const response = await removeDomainFromVercel(validatedRequest.subdomain, '', 'fullSite');
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
        const response = await changePublishStatusInSiteData(validatedRequest.subdomain, true, '');
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
        const response = await changePublishStatusInSiteData(validatedRequest.subdomain, false, '');
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
                redirect: 'joesburgers.vercel.app',
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
router.get('/scrape-images', async (req, res) => {
    const url = typeof req.query.url === 'string' ? req.query.url : '';
    try {
        const response = await scrapeImagesFromSite({ url: url, storagePath: 's3', method: 's3Upload' });
        res.json(response);
    }
    catch (err) {
        err.state = { ...err.state, req: req.body };
        handleError(err, res);
    }
});
export default router;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY21zLXJvdXRlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2FwaS9jbXMtcm91dGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsZ0JBQWdCLEVBQUUsU0FBUyxFQUFFLE1BQU0saUNBQWlDLENBQUE7QUFDeEYsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sMkJBQTJCLENBQUE7QUFDOUQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLHNDQUFzQyxDQUFBO0FBQ3RFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQTtBQUNsRSxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSwyQ0FBMkMsQ0FBQTtBQUMvRSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sNkJBQTZCLENBQUE7QUFDdEQsT0FBTyxFQUFFLDZCQUE2QixFQUFFLGFBQWEsRUFBRSx5QkFBeUIsRUFBRSxNQUFNLDhDQUE4QyxDQUFBO0FBQ3RJLE9BQU8sRUFBRSxlQUFlLEVBQUUsWUFBWSxFQUFFLE1BQU0sNEJBQTRCLENBQUE7QUFDMUUsT0FBTyxFQUFFLGVBQWUsRUFBRSxxQkFBcUIsRUFBRSxvQkFBb0IsRUFBa0IsaUJBQWlCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQTtBQUM1SSxPQUFPLE9BQU8sTUFBTSxTQUFTLENBQUE7QUFDN0IsT0FBTyxFQUFFLGNBQWMsRUFBRSwwQkFBMEIsRUFBRSxNQUFNLDBDQUEwQyxDQUFBO0FBQ3JHLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQTtBQUN4RCxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQTtBQUU5RSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxpREFBaUQsQ0FBQTtBQUN6RyxPQUFPLEVBQUUseUJBQXlCLEVBQUUscUJBQXFCLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQTtBQUNs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