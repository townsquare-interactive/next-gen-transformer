const { updatePageList, transformPagesData, createOrEditLayout, deletePages, createGlobalStylesheet } = require('../src/controllers/cms-controller')

const { addAssetFromSiteToS3, getFileS3, addMultipleS3, addFileS3 } = require('../src/s3Functions.js')

const { stripUrl, setColors, stripImageFolders } = require('../src/utils')

const engines = require('../src/translation-engines/basic')

const { publish } = require('../src/output/index.js')

const express = require('express')
const router = express.Router()

//chnage to save data
router.post('/save', async (req, res) => {
    try {
        //grab url to make S3 folder name
        const url = req.body.siteData.config.website.url
        const basePath = stripUrl(url)

        const themeStyles = setColors(req.body.siteData.design.colors, req.body.siteData.design.themes.selected)

        let globalFile
        globalFile = await createOrEditLayout(req.body.siteData, basePath, themeStyles)
        await addFileS3(globalFile, `${basePath}/layout`)

        let newPageList
        //Transforming and posting saved page data
        if (req.body.savedData.pages) {
            const newPageData = await transformPagesData(req.body.savedData.pages, req.body.siteData.pages, themeStyles, basePath)

            //adding each page to s3 (may need to move to controller)
            for (let i = 0; i < newPageData.pages.length; i++) {
                await addFileS3(newPageData.pages[i], `${basePath}/pages/${newPageData.pages[i].data.slug}`)
            }
            // update/create pagelist (uses new page )
            newPageList = await updatePageList(newPageData.pages, basePath)
        }

        if (req.body.savedData.favicon && req.body.savedData.favicon.src != null) {
            const faviconName = stripImageFolders(req.body.savedData.favicon)
            await addAssetFromSiteToS3(req.body.siteData.config.website.url + req.body.savedData.favicon, basePath + '/assets/' + faviconName)
        }

        if (req.body.savedData.deletePages) {
            const pageListUrl = `${basePath}/pages/page-list`
            const updatedPageList = await deletePages(req.body.savedData.deletePages, basePath)
            await addFileS3(updatedPageList, pageListUrl)
        }

        if (req.body.savedData.colors || req.body.savedData.fonts || req.body.savedData.code || req.body.savedData.pages) {
            const currentPageList = await getFileS3(`${basePath}/pages/page-list.json`, 'json')
            const globalStyles = await createGlobalStylesheet(
                themeStyles,
                req.body.siteData.design.fonts,
                req.body.siteData.design.code,
                currentPageList,
                basePath
            )
            await addFileS3(globalStyles, `${basePath}/global`, 'css')
        }

        //Adding new siteData file after saving
        await addFileS3(req.body.siteData, `${basePath}/siteData`)

        res.json('posting to s3 folder: ' + basePath)
    } catch (err) {
        console.error(err)
        res.status(500).json({ err: 'Something went wrong' })
    }
})

router.post('/site-data/basic', async (req, res) => {
    try {
        //siteIdentifier, themeStyles, siteLayout, pages, assets, globalStyles
        const data = engines.basic.translate()

        await publish({ ...data })
        res.json('posting to s3 folder: ' + 'basic')
    } catch (err) {
        console.log(err)
        res.status(500).json({ err: 'Something went wrong' })
    }
})

//Saving layout file for nav in header/footer
router.post('/cmsconfig', async (req, res) => {
    const basePath = stripUrl(req.body.config.website.url)

    try {
        const globalFile = await createOrEditLayout(req.body, basePath)
        await addFileS3(globalFile, `${basePath}/layout`)
        res.json(globalFile)
    } catch (err) {
        console.error(err)
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

module.exports = router
