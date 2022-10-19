const {
    transformCMSData,
    addMultipleS3,
    updatePageList,
    addFileS3,
    stripUrl,
    transformPagesData,
    createOrEditLayout,
} = require('../src/controllers/cms-controller')
const express = require('express')
const router = express.Router()

//chnage to save data
router.post('/save', async (req, res) => {
    try {
        //grab url to make S3 folder name
        const url = req.body.siteData.config.website.url
        const newUrl = stripUrl(url)

        let newPageList
        //Transforming and posting saved page data
        if (req.body.savedData.pages) {
            const newPageData = transformPagesData(req.body.savedData.pages, req.body.siteData.pages)

            //adding each page to s3
            for (let i = 0; i < newPageData.pages.length; i++) {
                await addFileS3(newPageData.pages[i], `${newUrl}/pages/${newPageData.pages[i].data.slug}.json`)
            }
            // update/create pagelist
            newPageList = await updatePageList(newPageData.pages, newUrl)
        }

        //Create or edit global file based off of pagelist updated above ^

        if (req.body.savedData.pages) {
            const globalFile = await createOrEditLayout(req.body.siteData, newUrl, newPageList)
            await addFileS3(globalFile, `${newUrl}/layout.json`)
        } else {
            const globalFile = await createOrEditLayout(req.body.siteData, newUrl)
            await addFileS3(globalFile, `${newUrl}/layout.json`)
        }

        //Adding new siteData file after saved
        await addFileS3(req.body.siteData, `${newUrl}/siteData.json`)
        res.json('posting to s3 folder: ' + newUrl)
    } catch (err) {
        console.error(err)
        res.status(500).json({ err: 'Something went wrong' })
    }
})

//Saving layout file for nav in header/footer
router.post('/cmsconfig', async (req, res) => {
    const newUrl = stripUrl(req.body.config.website.url)

    try {
        const globalFile = await createOrEditLayout(req.body, newUrl)
        await addFileS3(globalFile, `${newUrl}/layout.json`)
        res.json(globalFile)
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
        res.json('cms data added')
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
