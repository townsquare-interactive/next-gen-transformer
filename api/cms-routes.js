import { addFileS3 } from '../src/s3Functions.js'
import { stripUrl } from '../src/utils.js'
import { transformStrapi } from '../src/translation-engines/strapi.js'
import { transformLuna } from '../src/translation-engines/luna.js'
import { transformCreateSite } from '../src/translation-engines/create-site.js'
import { publish } from '../src/output/index.js'
import { addToSiteList, modifyVercelDomainPublishStatus, getSiteObjectFromS3 } from '../src/controllers/create-site-controller.js'
import { getFileS3 } from '../src/s3Functions.js'

import express from 'express'
const router = express.Router()

//save from luna cms
router.post('/save', async (req, res) => {
    console.log('save req')
    try {
        const url = req.body.siteData.config.website.url
        const basePath = stripUrl(url)
        const data = await transformLuna(req)
        await publish({ ...data })

        res.json('posting to s3 folder: ' + basePath)
    } catch (err) {
        console.error(err)
        res.status(500).json({ err: 'Something went wrong' })
    }
})

//website data sent for site creation
router.post('/create-site', async (req, res) => {
    console.log('create site route')

    try {
        const siteListStatus = await addToSiteList(req.body)
        const data = await transformCreateSite(req.body)
        await publish({ ...data })
        const response = await modifyVercelDomainPublishStatus(req.body.subdomain, 'POST')
        console.log('domain status: ', response)
        res.json('site status: ' + siteListStatus + ' Domain status: ' + response)
    } catch (err) {
        console.error(err)
        res.status(500).json({ err: 'Something went wrong in the transformer' })
    }
})

//publish site domain to vercel
router.post('/vercel-publish', async (req, res) => {
    console.log('publish site route', req.body)

    try {
        const response = await modifyVercelDomainPublishStatus(req.body.subdomain, 'POST')
        console.log(response)
        res.json(response)
    } catch (err) {
        console.error(err)
        res.status(500).json({ err: 'Something went wrong in the transformer' })
    }
})

//publish site domain to vercel
router.post('/vercel-unpublish', async (req, res) => {
    console.log('unpublish site route', req.body)

    try {
        const response = await modifyVercelDomainPublishStatus(req.body.subdomain, 'DELETE')
        console.log(response)
        res.json(response)
    } catch (err) {
        console.error(err)
        res.status(500).json({ err: 'Something went wrong in the transformer' })
    }
})

//publish site domain to vercel
router.post('/get-site', async (req, res) => {
    console.log('get site route', req.body)

    try {
        const currentSiteList = await getFileS3(`sites/site-list.json`, [])
        const currentSiteData = await getSiteObjectFromS3('', currentSiteList, 'id', req.body.id)
        res.json(currentSiteData)
    } catch (err) {
        console.error(err)
        res.status(500).json({ err: 'Something went wrong in the transformer' })
    }
})

//save from strapi webhook
router.post('/site-data/strapi', async (req, res) => {
    try {
        const data = await transformStrapi(req.body)
        console.log(data.pages)

        await publish({ ...data })
        res.json('posting to s3 folder: ' + 'strapi')
    } catch (err) {
        console.log(err)
        res.status(500).json({ err: 'Something went wrong' })
    }
})

//save all of site data in one file to s3
router.post('/cms', async (req, res) => {
    const basePath = stripUrl(req.body.config.website.url)

    try {
        await addFileS3(req.body, `${basePath}/siteData`)
        res.json('cms data added')
    } catch (err) {
        console.error(err)
        res.status(500).json({ err: 'Something went wrong' })
    }
})

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

export default router
