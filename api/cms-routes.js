const { transformCMSData, addMultipleS3, updatePageList, addFileS3, stripUrl, transformPagesData } = require('../src/controllers/cms-controller')
const express = require('express')
const router = express.Router()

//chnage to save data
router.post('/save', async (req, res) => {
    /*  try {
        //grab url to make S3 folder name
        const url = req.body.siteConfig.url
        newUrl = stripUrl(url)

        //Transforming and posting saved page data
        if (req.body.savedData.pages) {
            const newPageData = transformPagesData(req.body.savedData.pages, req.body.allPages)

            //adding each page to s3
            for (let i = 0; i < newPageData.pages.length; i++) {
                await addFileS3(newPageData.pages[i], `${newUrl}/pages/${newPageData.pages[i].data.slug}.json`)
            }
            // update/create pagelist
            await updatePageList(newPageData.pages, newUrl)
        } */
    try {
        //grab url to make S3 folder name
        const url = req.body.siteData.config.website.url
        newUrl = stripUrl(url)

        //Transforming and posting saved page data
        if (req.body.savedData.pages) {
            const newPageData = transformPagesData(req.body.savedData.pages, req.body.siteData.pages)

            //adding each page to s3
            for (let i = 0; i < newPageData.pages.length; i++) {
                await addFileS3(newPageData.pages[i], `${newUrl}/pages/${newPageData.pages[i].data.slug}.json`)
            }
            // update/create pagelist
            await updatePageList(newPageData.pages, newUrl)
        }
        res.json(newUrl)
    } catch (err) {
        console.error(err)
        res.status(500).json({ err: 'Something went wrong' })
    }
})

//save all of site data in one file to s3
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
