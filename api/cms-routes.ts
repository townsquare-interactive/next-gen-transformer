import { addFileS3, folderExistsInS3, getFileS3 } from '../src/s3Functions.js'
import { convertUrlToApexId } from '../src/utils.js'
import { transformStrapi } from '../src/translation-engines/strapi.js'
import { transformLuna } from '../src/translation-engines/luna.js'
import { transformCreateSite } from '../src/translation-engines/create-site.js'
import { saveToS3 } from '../src/output/save-to-s3.js'
import {
    publishDomainToVercel,
    changePublishStatusInSiteData,
    getDomainList,
    checkIfSiteExistsPostgres,
    removeDomainFromVercel,
} from '../src/controllers/create-site-controller.js'
import { logZodDataParse, zodDataParse } from '../schema/utils-zod.js'
import { saveInputSchema, createSiteInputSchema, SubdomainInputSchema } from '../schema/input-zod.js'
import { sql } from '@vercel/postgres'
import express from 'express'
import { validateLandingRequestData } from '../src/controllers/landing-controller.js'
import { handleError } from '../src/errors.js'
import { createLandingPageFiles } from '../src/translation-engines/landing.js'
const router = express.Router()

//save from luna cms
router.post('/save', async (req, res) => {
    try {
        //check input data for correct structure
        logZodDataParse(req.body, saveInputSchema, 'savedInput')

        try {
            const url = req.body.siteData.config.website.url
            const basePath = convertUrlToApexId(url)
            const data = await transformLuna(req)
            await saveToS3({ ...data })

            res.json('posting to s3 folder: ' + basePath)
        } catch (err) {
            console.error(err)
            res.status(500).json({ err: 'Something went wrong' })
        }
    } catch (err) {
        handleError(err, res)
    }
})

router.post('/landing', async (req, res) => {
    try {
        const { apexID, siteData } = validateLandingRequestData(req)

        const data = await createLandingPageFiles(siteData, apexID)
        const response = await saveToS3({ ...data })

        console.log(response)

        res.json(response)
    } catch (err) {
        err.state = { ...err.state, req: req.body }
        handleError(err, res, req.body.url)
    }
})

//website data sent for site creation
router.post('/create-site', async (req, res) => {
    try {
        //check input data for correct structure
        zodDataParse(req.body, createSiteInputSchema, 'createSite')

        try {
            //check if site is already created in s3
            const siteExistsInS3 = await folderExistsInS3(req.body.subdomain)

            //check postgres for it
            //const siteStatusPostgres = await checkIfSiteExistsPostgres(req.body.subdomain)

            //if (siteStatusPostgres === 'site exists' || siteExistsInS3) {
            if (siteExistsInS3) {
                return res.status(500).json('site already exists')
            } else {
                //const siteListStatus = await addToSiteList(req.body)
                const data = await transformCreateSite(req.body)
                await saveToS3({ ...data })
                const response = await publishDomainToVercel(req.body.subdomain)
                console.log('domain status: ', response)
                res.json(' Domain status: ' + response)
            }
        } catch (err) {
            console.error(err)
            res.status(500).json(`Domain not able to be created. (Already created or error)`)
        }
    } catch (err) {
        console.log(err)
        res.status(500).json('incorrect data structure received')
    }
})

//publish site domain to vercel
router.patch('/domain-publish', async (req, res) => {
    try {
        const validatedRequest = zodDataParse(req.body, SubdomainInputSchema, 'input')
        const response = await publishDomainToVercel(validatedRequest.subdomain)
        console.log(response)
        res.json(response)
    } catch (err) {
        handleError(err, res)
    }
})

//remove site domain to vercel
router.patch('/remove-domain', async (req, res) => {
    try {
        const validatedRequest = zodDataParse(req.body, SubdomainInputSchema, 'input')
        const response = await removeDomainFromVercel(validatedRequest.subdomain)
        console.log(response)
        res.json(response)
    } catch (err) {
        handleError(err, res)
    }
})

//update publish status for site
router.patch('/publish', async (req, res) => {
    try {
        const validatedRequest = zodDataParse(req.body, SubdomainInputSchema, 'input')
        const response = await changePublishStatusInSiteData(validatedRequest.subdomain, true)
        console.log(response)
        res.json(response)
    } catch (err) {
        handleError(err, res)
    }
})

router.patch('/unpublish', async (req, res) => {
    try {
        const validatedRequest = zodDataParse(req.body, SubdomainInputSchema, 'input')
        const response = await changePublishStatusInSiteData(validatedRequest.subdomain, false)
        console.log(response)
        res.json(response)
    } catch (err) {
        handleError(err, res)
    }
})

router.get('/get-templates', async (req, res) => {
    try {
        const siteTemplates = await getFileS3(`global-assets/templates/siteTemplates.json`, 'templates not found in s3')
        res.json(siteTemplates)
    } catch (err) {
        console.error(err)
        res.status(500).json({ err: 'Something went wrong' })
    }
})

//update vercel domain
router.patch('/update-domain', async (req, res) => {
    console.log('redirect', req.body)
    const domainName = req.body.subdomain + '.vercel.app'

    try {
        console.log('starting fetch', domainName)
        const response = await fetch(
            `https://api.vercel.com/v10/projects/${process.env.VERCEL_PROJECT_ID}/domains/${domainName}?teamId=${process.env.NEXT_PUBLIC_VERCEL_TEAM_ID}`,
            {
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
            }
        )

        console.log(response)
        res.json(response)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Something went wrong in the transformer' })
    }
})

//save from strapi webhook
router.post('/site-data/strapi', async (req, res) => {
    try {
        const data = await transformStrapi(req.body)
        console.log(data.pages)

        //await publish({ ...data }) //hidden for TS reasons
        res.json('posting to s3 folder: ' + 'strapi')
    } catch (err) {
        console.log(err)
        res.status(500).json({ err: 'Something went wrong' })
    }
})

//save all of site data in one file to s3
router.post('/cms', async (req, res) => {
    const basePath = convertUrlToApexId(req.body.config.website.url)

    try {
        await addFileS3(req.body, `${basePath}/siteData`)
        res.json('cms data added')
    } catch (err) {
        console.error(err)
        res.status(500).json({ err: 'Something went wrong' })
    }
})

router.get('/domain-list', async (req, res) => {
    try {
        const domainList = await getDomainList()
        res.json(domainList)
    } catch (err) {
        console.error(err)
        res.status(500).json({ err: 'Something went wrong' })
    }
})

/*-------- Domains ---------------*/
//save from luna cms
router.post('/domain', async (req, res) => {
    /*     const domain = req.body.domain 
    const apexId=req.body.apexId */

    try {
        //const result = await sql`CREATE TABLE Domains ( domain varchar(255), apex_id varchar(255) );`
        if (req.body.domain && req.body.apexId) {
            await sql`INSERT INTO Domains (domain, apex_id) VALUES (${req.body.domain}, ${req.body.apexId});`
        } else {
            console.log('missing req params')
        }

        const row = await sql`SELECT * FROM Domains WHERE domain = ${req.body.domain};`
        const apexId = row.rows[0].apexid
        console.log(row)

        return res.status(200).json({ apexId })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ 'transformer error': { error } })
    }
})

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
    const siteStatus = await checkIfSiteExistsPostgres(req.body.domain)
    if (siteStatus === 'site exists') {
        return res.status(500).json({ 'error adding site data': { siteStatus } })
    } else {
        return res.status(200).json({ siteStatus })
    }
})
//save from luna cms
router.post('/delete-row', async (req, res) => {
    try {
        const row = await sql`DELETE FROM Domains WHERE domain = ${req.body.domain};`

        return res.status(200).json({ row })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ 'this is error': { error } })
    }
})

//currently all pages are not passed in save from cms
router.post('/migrate', async (req, res) => {
    try {
        //check input data for correct structure
        zodDataParse(req.body, saveInputSchema, 'savedInput')

        //transform to migrate form
        //move data into pages
        let newPages = {}
        for (let [key, value] of Object.entries(req.body.siteData.pages)) {
            console.log(value)
            let newPage: any = value
            if (newPage.publisher) {
                value = { ...newPage, data: newPage.publisher.data }
                newPages = { ...newPages, [key]: value }
            }
        }

        if (req.body.siteData.config.website.favicon.src) {
            req.body.savedData.favicon = req.body.siteData.config.website.favicon.src
        }

        //change savedData to have all pages
        req.body.savedData = { ...req.body.savedData, pages: newPages }

        try {
            const url = req.body.siteData.config.website.url
            const basePath = convertUrlToApexId(url)
            const data = await transformLuna(req)
            await saveToS3({ ...data })

            res.json('posting to s3 folder: ' + basePath)
        } catch (err) {
            console.error(err)
            res.status(500).json({ err: 'Something went wrong' })
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ err: 'incorrect data structure received' })
    }
})

export default router
