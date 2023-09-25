import { addFileS3 } from '../src/s3Functions.js'
import { stripUrl } from '../src/utils.js'
import { transformStrapi } from '../src/translation-engines/strapi.js'
import { transformLuna } from '../src/translation-engines/luna.js'
import { publish } from '../src/output/index.js'

import express from 'express'
const router = express.Router()

//save from luna cms
router.post('/save', async (req, res) => {
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

//save from strapi webhook
router.post('/site-data/strapi', async (req, res) => {
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
        const data = await transformStrapi(req.body)

        console.log(data.pages)

        await publish({ ...data })
        res.json('posting to s3 folder: ' + 'strapi')

        // await publish({ ...data })
        //res.json('posting to s3 folder: ' + 'basic')
    } catch (err) {
        console.log(err)
        res.status(500).json({ err: 'Something went wrong' })
    }
})

/* router.post('/site-data/basic', async (req, res) => {
    try {
        const data = engines.basic.translate()

        await publish({ ...data })
        res.json('posting to s3 folder: ' + 'basic')
    } catch (err) {
        console.log(err)
        res.status(500).json({ err: 'Something went wrong' })
    }
}) */

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
