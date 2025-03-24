import { folderExistsInS3, getFileS3 } from '../src/utilities/s3Functions.js'
import { checkAuthToken, convertUrlToApexId } from '../src/utilities/utils.js'
import { transformLuna } from '../src/translation-engines/luna.js'
import { transformCreateSite } from '../src/translation-engines/create-site.js'
import { saveToS3 } from '../src/output/save-to-s3.js'
import { save } from '../src/output/save-scraped-data.js'
import {
    getPageList,
    getScrapedDataFromS3,
    getScrapeSettings,
    moveS3DataToDuda,
    removeScrapedFolder,
    scrapeAssetsFromSite,
} from '../src/controllers/scrape-controller.js'
import { changePublishStatusInSiteData } from '../src/controllers/create-site-controller.js'
import { logZodDataParse, zodDataParse } from '../src/schema/utils-zod.js'
import {
    saveInputSchema,
    createSiteInputSchema,
    SubdomainInputSchema,
    RequestDataReq,
    RequestDataSchema,
    ScrapeWebsiteSchema,
    GetPageListSchema,
    ScrapePagesSchema,
    GetScrapeDataSchema,
    MoveS3DataToDudaSchema,
} from '../src/schema/input-zod.js'
import express from 'express'
import { getRequestData, validateLandingRequestData } from '../src/controllers/landing-controller.js'
import { handleError } from '../src/utilities/errors.js'
import { createLandingPageFiles } from '../src/translation-engines/landing.js'
import { DomainRes } from '../types.js'
import { removeLandingProject, removeLandingSite } from '../src/controllers/remove-landing-controller.js'
import { checkDomainConfigOnVercel, publishDomainToVercel, removeDomainFromVercel } from '../src/controllers/domain-controller.js'

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

const useDomainPublish = process.env.CREATE_SITE_DOMAINS === '0' ? false : true //publish new url for each client
router.post('/landing', async (req, res) => {
    try {
        checkAuthToken(req)
        const { apexID, siteData, domainOptions } = validateLandingRequestData(req)
        const data = await createLandingPageFiles(siteData, apexID)
        const s3Res = await saveToS3({ ...data })

        if (useDomainPublish) {
            const domainResponse: DomainRes = await publishDomainToVercel(domainOptions, apexID, siteData.pageUri || '')
            console.log(domainResponse)
            res.json(domainResponse)
        } else {
            console.log(s3Res)
            res.json(s3Res)
        }
    } catch (err) {
        err.state = { ...err.state, req: req.body }
        handleError(err, res, req.body.url)
    }
})

router.delete('/landing-domains/:domain', async (req, res) => {
    try {
        const response = await removeLandingSite(req.params)
        res.json(response)
    } catch (err) {
        err.state = { ...err.state, req: req.params }
        handleError(err, res, req.params.domain)
    }
})

router.delete('/apexIDs/:apexID', async (req, res) => {
    try {
        const response = await removeLandingProject(req.params)
        res.json(response)
    } catch (err) {
        err.state = { ...err.state, req: req.params }
        handleError(err, res, req.params.apexID)
    }
})

router.get('/check-domain-config', async (req, res) => {
    try {
        const domain = req.query.domain || ''

        if (typeof domain !== 'string') {
            return res.status(400).json({ error: 'Invalid domain parameter' })
        }

        const response = await checkDomainConfigOnVercel(domain)
        res.json(response)
    } catch (err) {
        err.state = { ...err.state, req: req.body }
        handleError(err, res)
    }
})

//
router.get('/landing-request-data', async (req, res) => {
    try {
        const reqData = zodDataParse<RequestDataReq, typeof RequestDataSchema>(req.query as RequestDataReq, RequestDataSchema, 'parse')
        const domain = reqData.domain
        const response = await getRequestData(domain)
        res.json(response)
    } catch (err) {
        err.state = { ...err.state, req: req.body }
        handleError(err, res)
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

            if (siteExistsInS3) {
                return res.status(500).json('site already exists')
            } else {
                const data = await transformCreateSite(req.body)
                await saveToS3({ ...data })
                const response = await publishDomainToVercel({ domain: req.body.subdomain, usingPreview: true }, req.body.subdomain)
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
        const response = await publishDomainToVercel({ domain: validatedRequest.subdomain, usingPreview: true }, validatedRequest.subdomain)
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
        const response = await removeDomainFromVercel(validatedRequest.subdomain, '', 'fullSite')
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
        const response = await changePublishStatusInSiteData(validatedRequest.subdomain, true, '')
        console.log(response)
        res.json(response)
    } catch (err) {
        handleError(err, res)
    }
})

router.patch('/unpublish', async (req, res) => {
    try {
        const validatedRequest = zodDataParse(req.body, SubdomainInputSchema, 'input')
        const response = await changePublishStatusInSiteData(validatedRequest.subdomain, false, '')
        console.log(response)
        res.json(response)
    } catch (err) {
        handleError(err, res)
    }
})

//get templates for creating a new Apex site
router.get('/get-templates', async (req, res) => {
    try {
        const siteTemplates = await getFileS3(`global-assets/templates/siteTemplates.json`, 'templates not found in s3')
        res.json(siteTemplates)
    } catch (err) {
        handleError(err, res)
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
        handleError(err, res)
    }
})

router.get('/page-list', async (req, res) => {
    try {
        checkAuthToken(req)
        const validatedRequest = zodDataParse(req.query, GetPageListSchema, 'getPagesInput')
        const url = validatedRequest.url as string
        const scrapeSettings = getScrapeSettings({ url: url })
        const pages = await getPageList(scrapeSettings)
        res.json(pages)
    } catch (err) {
        err.state = { ...err.state, req: req.query }
        handleError(err, res, req.query.url as string)
    }
})

router.post('/scrape-pages', async (req, res) => {
    try {
        checkAuthToken(req)
        const validatedRequest = zodDataParse(req.body, ScrapePagesSchema, 'scrapedPagesInput')
        const scrapeSettings = getScrapeSettings(validatedRequest)
        const scrapedData = await scrapeAssetsFromSite(scrapeSettings, validatedRequest.pages)
        const saveResponse = await save(scrapeSettings, scrapedData)
        res.json(saveResponse)
    } catch (err) {
        err.state = { ...err.state, req: req.body }
        handleError(err, res, req.body.url)
    }
})

router.post('/scrape-site', async (req, res) => {
    try {
        checkAuthToken(req)
        const validatedRequest = zodDataParse(req.body, ScrapeWebsiteSchema, 'scrapedInput')
        const scrapeSettings = getScrapeSettings(validatedRequest)
        const scrapedData = await scrapeAssetsFromSite(scrapeSettings)
        const saveResponse = await save(scrapeSettings, scrapedData)
        res.json(saveResponse)
    } catch (err) {
        err.state = { ...err.state, req: req.body }
        handleError(err, res, req.body.url)
    }
})

router.delete('/scrape-site/:url', async (req, res) => {
    try {
        checkAuthToken(req)
        const response = await removeScrapedFolder(req.params.url)
        res.status(response.status === 'success' ? 200 : 404).json(response)
    } catch (err) {
        err.state = { ...err.state, req: req.params }
        handleError(err, res, req.params.url)
    }
})

router.get('/scraped-data', async (req, res) => {
    try {
        checkAuthToken(req)
        const validatedRequest = zodDataParse(req.query, GetScrapeDataSchema, 'getScrapedData')
        const url = validatedRequest.url as string

        const scrapedData = await getScrapedDataFromS3(url)
        res.json(scrapedData)
    } catch (err) {
        err.state = { ...err.state, req: req.query }
        handleError(err, res, req.query.url as string)
    }
})

//moveS3DataToDuda
router.post('/move-s3-data-to-duda', async (req, res) => {
    try {
        checkAuthToken(req)
        const validatedRequest = zodDataParse(req.body, MoveS3DataToDudaSchema, 'moveS3DataToDuda')
        const scrapedData = await getScrapedDataFromS3(validatedRequest.url)
        const moveResponse = await moveS3DataToDuda(scrapedData, validatedRequest.uploadLocation)
        res.json(moveResponse)
    } catch (err) {
        err.state = { ...err.state, req: req.body }
        handleError(err, res, req.body.url)
    }
})

export default router
