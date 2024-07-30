import { addFileS3, folderExistsInS3, getFileS3 } from '../src/s3Functions.js';
import { convertUrlToApexId } from '../src/utils.js';
import { transformStrapi } from '../src/translation-engines/strapi.js';
import { transformLuna } from '../src/translation-engines/luna.js';
import { transformCreateSite } from '../src/translation-engines/create-site.js';
import { saveToS3 } from '../src/output/save-to-s3.js';
import { publishDomainToVercel, changePublishStatusInSiteData, getDomainList, checkIfSiteExistsPostgres, removeDomainFromVercel, } from '../src/controllers/create-site-controller.js';
import { logZodDataParse, zodDataParse } from '../schema/utils-zod.js';
import { saveInputSchema, createSiteInputSchema, SubdomainInputSchema } from '../schema/input-zod.js';
import { sql } from '@vercel/postgres';
import express from 'express';
import { validateLandingRequestData } from '../src/controllers/landing-controller.js';
import { handleError } from '../src/errors.js';
import { createLandingPageFiles } from '../src/translation-engines/landing.js';
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
router.post('/landing', async (req, res) => {
    try {
        const { apexID, siteData } = validateLandingRequestData(req);
        const data = await createLandingPageFiles(siteData, apexID);
        const response = await saveToS3({ ...data });
        console.log(response);
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
            //check postgres for it
            //const siteStatusPostgres = await checkIfSiteExistsPostgres(req.body.subdomain)
            //if (siteStatusPostgres === 'site exists' || siteExistsInS3) {
            if (siteExistsInS3) {
                return res.status(500).json('site already exists');
            }
            else {
                //const siteListStatus = await addToSiteList(req.body)
                const data = await transformCreateSite(req.body);
                await saveToS3({ ...data });
                const response = await publishDomainToVercel(req.body.subdomain);
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
        const response = await publishDomainToVercel(validatedRequest.subdomain);
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
//save from luna cms
router.post('/domain', async (req, res) => {
    /*     const domain = req.body.domain
    const apexId=req.body.apexId */
    try {
        //const result = await sql`CREATE TABLE Domains ( domain varchar(255), apex_id varchar(255) );`
        if (req.body.domain && req.body.apexId) {
            await sql `INSERT INTO Domains (domain, apex_id) VALUES (${req.body.domain}, ${req.body.apexId});`;
        }
        else {
            console.log('missing req params');
        }
        const row = await sql `SELECT * FROM Domains WHERE domain = ${req.body.domain};`;
        const apexId = row.rows[0].apexid;
        console.log(row);
        return res.status(200).json({ apexId });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ 'transformer error': { error } });
    }
});
//save from luna cms
router.post('/domain-check', async (req, res) => {
    /*     try {
        const row = await sql`SELECT * FROM Domains WHERE domain = ${req.body.domain};`
        //const apexId = row.rows[0].apexid
        const isThere = row.rowCount > 0 ? true : false
        const foundStatus = isThere === true ? 'site exists' : 'not found'
        console.log(foundStatus)

        return res.status(200).json({ foundStatus })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ 'this is error': { error } })
    } */
    const siteStatus = await checkIfSiteExistsPostgres(req.body.domain);
    if (siteStatus === 'site exists') {
        return res.status(500).json({ 'error adding site data': { siteStatus } });
    }
    else {
        return res.status(200).json({ siteStatus });
    }
});
//save from luna cms
router.post('/delete-row', async (req, res) => {
    try {
        const row = await sql `DELETE FROM Domains WHERE domain = ${req.body.domain};`;
        return res.status(200).json({ row });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ 'this is error': { error } });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY21zLXJvdXRlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2FwaS9jbXMtcm91dGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsZ0JBQWdCLEVBQUUsU0FBUyxFQUFFLE1BQU0sdUJBQXVCLENBQUE7QUFDOUUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0saUJBQWlCLENBQUE7QUFDcEQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLHNDQUFzQyxDQUFBO0FBQ3RFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQTtBQUNsRSxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSwyQ0FBMkMsQ0FBQTtBQUMvRSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sNkJBQTZCLENBQUE7QUFDdEQsT0FBTyxFQUNILHFCQUFxQixFQUNyQiw2QkFBNkIsRUFDN0IsYUFBYSxFQUNiLHlCQUF5QixFQUN6QixzQkFBc0IsR0FDekIsTUFBTSw4Q0FBOEMsQ0FBQTtBQUNyRCxPQUFPLEVBQUUsZUFBZSxFQUFFLFlBQVksRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBQ3RFLE9BQU8sRUFBRSxlQUFlLEVBQUUscUJBQXFCLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQTtBQUNyRyxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sa0JBQWtCLENBQUE7QUFDdEMsT0FBTyxPQUFPLE1BQU0sU0FBUyxDQUFBO0FBQzdCLE9BQU8sRUFBRSwwQkFBMEIsRUFBRSxNQUFNLDBDQUEwQyxDQUFBO0FBQ3JGLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQTtBQUM5QyxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQTtBQUM5RSxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUE7QUFFL0Isb0JBQW9CO0FBQ3BCLE1BQU0sQ0FBQyxJQUFJLENB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