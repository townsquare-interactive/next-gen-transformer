import { addFileS3, folderExistsInS3, getFileS3 } from '../src/utilities/s3Functions.js';
import { convertUrlToApexId } from '../src/utilities/utils.js';
import { transformLuna } from '../src/translation-engines/luna.js';
import { transformCreateSite } from '../src/translation-engines/create-site.js';
import { saveToS3 } from '../src/output/save-to-s3.js';
import { save } from '../src/output/save-scraped-data.js';
import { getPageList, getScrapeSettings, removeScrapedFolder, scrapeAssetsFromSite } from '../src/controllers/scrape-controller.js';
import { changePublishStatusInSiteData, getDomainList, checkIfSiteExistsPostgres } from '../src/controllers/create-site-controller.js';
import { logZodDataParse, zodDataParse } from '../src/schema/utils-zod.js';
import { saveInputSchema, createSiteInputSchema, SubdomainInputSchema, RequestDataSchema, ScrapeWebsiteSchema, GetPageListSchema, ScrapePagesSchema, } from '../src/schema/input-zod.js';
import express from 'express';
import { getRequestData, validateLandingRequestData } from '../src/controllers/landing-controller.js';
import { AuthorizationError, ValidationError, handleError } from '../src/utilities/errors.js';
import { createLandingPageFiles } from '../src/translation-engines/landing.js';
import { removeLandingProject, removeLandingSite } from '../src/controllers/remove-landing-controller.js';
import { checkDomainConfigOnVercel, publishDomainToVercel, removeDomainFromVercel } from '../src/controllers/domain-controller.js';
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
        const correctBearerToken = checkAuthToken(req);
        if (!correctBearerToken) {
            throw new AuthorizationError({
                message: 'Incorrect authorization bearer token',
                errorType: 'AUT-017',
                state: {},
            });
        }
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
/* router.post('/site-data/strapi', async (req, res) => {
    try {
        const data = await transformStrapi(req.body)
        console.log(data.pages)

        //await publish({ ...data }) //hidden for TS reasons
        res.json('posting to s3 folder: ' + 'strapi')
    } catch (err) {
        console.log(err)
        res.status(500).json({ err: 'Something went wrong' })
    }
}) */
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
router.get('/page-list', async (req, res) => {
    try {
        const correctBearerToken = checkAuthToken(req);
        if (!correctBearerToken) {
            throw new AuthorizationError({
                message: 'Incorrect authorization bearer token',
                errorType: 'AUT-017',
                state: {},
            });
        }
        const validatedRequest = zodDataParse(req.query, GetPageListSchema, 'getPagesInput');
        const url = validatedRequest.url;
        const scrapeSettings = getScrapeSettings({ url: url });
        const pages = await getPageList(scrapeSettings);
        res.json(pages);
    }
    catch (err) {
        err.state = { ...err.state, req: req.query };
        handleError(err, res, req.query.url);
    }
});
router.post('/scrape-pages', async (req, res) => {
    try {
        const correctBearerToken = checkAuthToken(req);
        if (!correctBearerToken) {
            throw new AuthorizationError({
                message: 'Incorrect authorization bearer token',
                errorType: 'AUT-017',
                state: {},
            });
        }
        const validatedRequest = zodDataParse(req.body, ScrapePagesSchema, 'scrapedPagesInput');
        const scrapeSettings = getScrapeSettings(validatedRequest);
        const scrapedData = await scrapeAssetsFromSite(scrapeSettings, validatedRequest.pages);
        const saveResponse = await save(scrapeSettings, scrapedData);
        res.json(saveResponse);
    }
    catch (err) {
        err.state = { ...err.state, req: req.body };
        handleError(err, res, req.body.url);
    }
});
router.post('/scrape-site', async (req, res) => {
    try {
        const correctBearerToken = checkAuthToken(req);
        if (!correctBearerToken) {
            throw new AuthorizationError({
                message: 'Incorrect authorization bearer token',
                errorType: 'AUT-017',
                state: {},
            });
        }
        const validatedRequest = zodDataParse(req.body, ScrapeWebsiteSchema, 'scrapedInput');
        const scrapeSettings = getScrapeSettings(validatedRequest);
        const scrapedData = await scrapeAssetsFromSite(scrapeSettings);
        const saveResponse = await save(scrapeSettings, scrapedData);
        res.json(saveResponse);
    }
    catch (err) {
        err.state = { ...err.state, req: req.body };
        handleError(err, res, req.body.url);
    }
});
router.delete('/scrape-site/:url', async (req, res) => {
    try {
        const correctBearerToken = checkAuthToken(req);
        if (!correctBearerToken) {
            throw new AuthorizationError({
                message: 'Incorrect authorization bearer token',
                errorType: 'AUT-017',
                state: {},
            });
        }
        const response = await removeScrapedFolder(req.params.url);
        res.json(response);
    }
    catch (err) {
        err.state = { ...err.state, req: req.params };
        handleError(err, res, req.params.url);
    }
});
const checkAuthToken = (req) => {
    try {
        const authHeader = req.headers['authorization'];
        if (authHeader) {
            const token = authHeader.split(' ')[1]; // Extract the token (Bearer <token>)
            if (token != process.env.TRANSFORMER_API_KEY) {
                return false;
            }
            return true;
        }
        return false;
    }
    catch (err) {
        throw new ValidationError({
            message: 'Error attempting to validate Bearer token: ' + err.message,
            errorType: 'VAL-015',
            state: {},
        });
    }
};
export default router;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY21zLXJvdXRlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2FwaS9jbXMtcm91dGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsZ0JBQWdCLEVBQUUsU0FBUyxFQUFFLE1BQU0saUNBQWlDLENBQUE7QUFDeEYsT0FBTyxFQUFFLGtCQUFrQixFQUF1QixNQUFNLDJCQUEyQixDQUFBO0FBRW5GLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQTtBQUNsRSxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSwyQ0FBMkMsQ0FBQTtBQUMvRSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sNkJBQTZCLENBQUE7QUFDdEQsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLG9DQUFvQyxDQUFBO0FBQ3pELE9BQU8sRUFBRSxXQUFXLEVBQUUsaUJBQWlCLEVBQUUsbUJBQW1CLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQTtBQUNuSSxPQUFPLEVBQUUsNkJBQTZCLEVBQUUsYUFBYSxFQUFFLHlCQUF5QixFQUFFLE1BQU0sOENBQThDLENBQUE7QUFDdEksT0FBTyxFQUFFLGVBQWUsRUFBRSxZQUFZLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQTtBQUMxRSxPQUFPLEVBQ0gsZUFBZSxFQUNmLHFCQUFxQixFQUNyQixvQkFBb0IsRUFFcEIsaUJBQWlCLEVBQ2pCLG1CQUFtQixFQUNuQixpQkFBaUIsRUFDakIsaUJBQWlCLEdBQ3BCLE1BQU0sNEJBQTRCLENBQUE7QUFDbkMsT0FBTyxPQUFvQixNQUFNLFNBQVMsQ0FBQTtBQUMxQyxPQUFPLEVBQUUsY0FBYyxFQUFFLDBCQUEwQixFQUFFLE1BQU0sMENBQTBDLENBQUE7QUFDckcsT0FBTyxFQUFFLGtCQUFrQixFQUFFLGVBQWUsRUFBRSxXQUFXLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQTtBQUM3RixPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFB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