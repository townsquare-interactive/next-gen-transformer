const {
    transformCMSData,
    addMultipleS3,
    transformPageData,
    updatePageList,
    addFileS3,
    stripUrl,
    transformPagesData,
} = require('../src/controllers/cms-controller')

const express = require('express')
const router = express.Router()

router.get('/', async (req, res) => {
    try {
        res.json({
            status: 200,
            message: 'Get data has successfully',
        })
    } catch (error) {
        console.error(error)
        return res.status(500).send('Server error')
    }
})
//save all of site data to s3
router.post('/cms', async (req, res) => {
    const newUrl = stripUrl(req.body.config.website.url)

    try {
        await addFileS3(req.body, `${newUrl}/siteData.json`)
        res.json('Site Data added')
    } catch (err) {
        console.error(err)
        res.status(500).json({ err: 'Something went wrong' })
    }
})

//chnage to save data
router.post('/save', async (req, res) => {
    const url = req.body.siteConfig.url
    newUrl = stripUrl(url)

    const newPageData = transformPagesData(req.body.savedData.pages, req.body.allPages)

    try {
        //await addFileS3(req.body, `${newUrl}/cmsSave.json`) //debugging passed data

        //save each page
        for (let i = 0; i < newPageData.pages.length; i++) {
            await addFileS3(newPageData.pages[i], `${newUrl}/pages/${newPageData.pages[i].data.slug}.json`)
        }
        await updatePageList(newPageData.pages, newUrl)
        res.json(newUrl)
    } catch (err) {
        console.error(err)
        res.status(500).json({ err: 'Something went wrong' })
    }
})

/* router.post('/page', async (req, res) => {
    const newPageData = transformPageData(req.body.page)
    const newUrl = stripUrl(req.body.data.url)

    try {
        updatePageList(req.body.page, newUrl)
        await addFileS3(newPageData, `${newUrl}/pages/${newPageData.slug}.json`)

        res.json(JSON.stringify('page added'))
    } catch (err) {
        console.error(err)
        res.status(500).json({ err: 'Something went wrong' })
    }
}) */

/* router.post('/sitedata', async (req, res) => {
    const newUrl = req.body.siteData.url

    try {
        await addFileS3(req.body, `${newUrl}/siteData.json`)
        //save each page

        res.json(req.body)
    } catch (err) {
        console.error(err)
        res.status(500).json({ err: 'Something went wrong' })
    }
})
 */

//takes all site data and adds pages using backup data
router.post('/migrate', async (req, res) => {
    const newData = transformCMSData(req.body)
    const newUrl = stripUrl(req.body.config.website.url)

    try {
        await addMultipleS3(newData.data, newData.pageList, newUrl)
        res.json('All Files added')
    } catch (err) {
        console.error(err)
        res.status(500).json({ err: 'Something went wrong' })
    }
})

module.exports = router
