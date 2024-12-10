import { addFileS3, folderExistsInS3, getFileS3 } from '../src/utilities/s3Functions.js';
import { convertUrlToApexId } from '../src/utilities/utils.js';
import { transformStrapi } from '../src/translation-engines/strapi.js';
import { transformLuna } from '../src/translation-engines/luna.js';
import { transformCreateSite } from '../src/translation-engines/create-site.js';
import { saveToS3 } from '../src/output/save-to-s3.js';
import { saveScrapedImages } from '../src/output/save-scraped-images.js';
import { changePublishStatusInSiteData, getDomainList, checkIfSiteExistsPostgres } from '../src/controllers/create-site-controller.js';
import { logZodDataParse, zodDataParse } from '../src/schema/utils-zod.js';
import { saveInputSchema, createSiteInputSchema, SubdomainInputSchema, RequestDataSchema, ScrapeImageSchema } from '../src/schema/input-zod.js';
import express from 'express';
import { getRequestData, validateLandingRequestData } from '../src/controllers/landing-controller.js';
import { handleError } from '../src/utilities/errors.js';
import { createLandingPageFiles } from '../src/translation-engines/landing.js';
import { removeLandingProject, removeLandingSite } from '../src/controllers/remove-landing-controller.js';
import { checkDomainConfigOnVercel, publishDomainToVercel, removeDomainFromVercel } from '../src/controllers/domain-controller.js';
import { scrapeImagesFromSite } from './scrapers/image-scrape.js';
/* import { batchUploadToDuda } from '../src/services/save-to-duda.js' */
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
//return { uploadedImages: allUploads, imageUploadCount: succesfulImageCount, failedUploadCount: failedImageCount }
router.post('/scrape-images', async (req, res) => {
    try {
        //check input data for correct structure
        const validatedRequest = zodDataParse(req.body, ScrapeImageSchema, 'scrapedInput');
        const scrapeSettings = { url: validatedRequest.url, savingMethod: validatedRequest.savingMethod, uploadLocation: validatedRequest.uploadLocation };
        const scrapedImages = await scrapeImagesFromSite(scrapeSettings);
        const savedInfo = await saveScrapedImages(scrapeSettings, scrapedImages.imageFiles);
        res.json({
            imageUploadTotal: savedInfo.imageUploadTotal || 0,
            failedImageCount: savedInfo.failedImageList.length,
            uploadedResources: savedInfo.uploadedResources || [],
            failedImages: savedInfo.failedImageList,
            url: scrapedImages.url,
        });
    }
    catch (err) {
        err.state = { ...err.state, req: req.body };
        handleError(err, res);
    }
});
export default router;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY21zLXJvdXRlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2FwaS9jbXMtcm91dGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsZ0JBQWdCLEVBQUUsU0FBUyxFQUFFLE1BQU0saUNBQWlDLENBQUE7QUFDeEYsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sMkJBQTJCLENBQUE7QUFDOUQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLHNDQUFzQyxDQUFBO0FBQ3RFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQTtBQUNsRSxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSwyQ0FBMkMsQ0FBQTtBQUMvRSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sNkJBQTZCLENBQUE7QUFDdEQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sc0NBQXNDLENBQUE7QUFDeEUsT0FBTyxFQUFFLDZCQUE2QixFQUFFLGFBQWEsRUFBRSx5QkFBeUIsRUFBRSxNQUFNLDhDQUE4QyxDQUFBO0FBQ3RJLE9BQU8sRUFBRSxlQUFlLEVBQUUsWUFBWSxFQUFFLE1BQU0sNEJBQTRCLENBQUE7QUFDMUUsT0FBTyxFQUFFLGVBQWUsRUFBRSxxQkFBcUIsRUFBRSxvQkFBb0IsRUFBa0IsaUJBQWlCLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQTtBQUMvSixPQUFPLE9BQU8sTUFBTSxTQUFTLENBQUE7QUFDN0IsT0FBTyxFQUFFLGNBQWMsRUFBRSwwQkFBMEIsRUFBRSxNQUFNLDBDQUEwQyxDQUFBO0FBQ3JHLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQTtBQUN4RCxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQTtBQUU5RSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxpREFBaUQsQ0FBQTtBQUN6RyxPQUFPLEVBQUUs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