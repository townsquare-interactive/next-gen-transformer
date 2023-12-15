import { addFileS3, addFolderS3, folderExistsInS3 } from '../src/s3Functions.js'
import { stripUrl } from '../src/utils.js'
import { transformStrapi } from '../src/translation-engines/strapi.js'
import { transformLuna } from '../src/translation-engines/luna.js'
import { transformCreateSite } from '../src/translation-engines/create-site.js'
import { publish } from '../src/output/index.js'
import { modifyVercelDomainPublishStatus, changePublishStatusInSiteData, addToSiteList, getDomainList } from '../src/controllers/create-site-controller.js'
import { zodDataParse } from '../output-zod.js'
import { saveInputSchema } from '../input-zod.js'

import express from 'express'
const router = express.Router()

//save from luna cms
router.post('/save', async (req, res) => {
    console.log('save req')

    try {
        //check input data for correct structure
        zodDataParse(req.body, saveInputSchema, 'savedInput', 'parse')

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
    } catch (err) {
        console.log(err)
        res.status(500).json({ err: 'incorrect data structure received' })
    }
})

//website data sent for site creation
router.post('/create-site', async (req, res) => {
    console.log('create site route')

    try {
        //check if site is already created in s3
        const siteExistsInS3 = await folderExistsInS3(req.body.subdomain)

        if (siteExistsInS3) {
            res.status(500).json(`Site already in s3`)
        } else {
            const siteListStatus = await addToSiteList(req.body)
            const data = await transformCreateSite(req.body)
            await publish({ ...data })
            const response = await modifyVercelDomainPublishStatus(req.body.subdomain, 'POST')
            console.log('domain status: ', response)
            res.json(' Domain status: ' + response)
        }
    } catch (err) {
        console.error(err)
        res.status(500).json(`Site not able to be created. (Already created or error)`)
    }
})

//publish site domain to vercel
router.patch('/domain-publish', async (req, res) => {
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

//remove site domain to vercel
router.patch('/remove-domain', async (req, res) => {
    console.log('removing domain site route', req.body)

    try {
        const response = await modifyVercelDomainPublishStatus(req.body.subdomain, 'DELETE')
        console.log(response)
        res.json(response)
    } catch (err) {
        console.error(err)
        res.status(500).json({ err: 'Something went wrong in the transformer' })
    }
})

//update publish status for site
router.patch('/publish', async (req, res) => {
    console.log('publish site route', req.body)

    try {
        const response = await changePublishStatusInSiteData(req.body.subdomain, true)
        console.log(response)
        res.json(response)
    } catch (err) {
        console.error(err)
        res.status(500).json({ err: 'Something went wrong in the transformer' })
    }
})

router.patch('/unpublish', async (req, res) => {
    console.log('unpublish site route', req.body)

    try {
        const response = await changePublishStatusInSiteData(req.body.subdomain, false)
        console.log(response)
        res.json(response)
    } catch (err) {
        console.error(err)
        res.status(500).json({ err: 'Something went wrong in the transformer' })
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

router.get('/domain-list', async (req, res) => {
    try {
        const domainList = await getDomainList()
        res.json(domainList)
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
