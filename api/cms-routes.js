const {
    transformCMSData,
    addMultipleS3,
    updatePageList,
    addFileS3,
    transformPagesData,
    createOrEditLayout,
    deletePages,
    addAssetFromSiteToS3,
} = require('../src/controllers/cms-controller')

const { stripUrl, setColors, stripImageFolders, createGlobalStylesheet, createCustomStylesheet } = require('../src/utils')

const express = require('express')
const router = express.Router()

//chnage to save data
router.post('/save', async (req, res) => {
    try {
        //grab url to make S3 folder name
        const url = req.body.siteData.config.website.url
        const newUrl = stripUrl(url)

        const themeStyles = setColors(req.body.siteData.design.colors, req.body.siteData.design.themes.selected)

        let newPageList
        //Transforming and posting saved page data
        if (req.body.savedData.pages) {
            const newPageData = transformPagesData(req.body.savedData.pages, req.body.siteData.pages, themeStyles)

            //adding each page to s3
            for (let i = 0; i < newPageData.pages.length; i++) {
                await addFileS3(newPageData.pages[i], `${newUrl}/pages/${newPageData.pages[i].data.slug}`)
            }
            // update/create pagelist
            newPageList = await updatePageList(newPageData.pages, newUrl)
        }

        let globalFile
        globalFile = await createOrEditLayout(req.body.siteData, newUrl, themeStyles)

        await addFileS3(globalFile, `${newUrl}/layout`)

        if (req.body.savedData.favicon) {
            const faviconName = stripImageFolders(req.body.savedData.favicon)

            await addAssetFromSiteToS3(req.body.siteData.config.website.url + req.body.savedData.favicon, newUrl + '/assets/' + faviconName)
        }

        if (req.body.savedData.deletePages) {
            const pageListUrl = `${newUrl}/pages/page-list.json`
            const updatedPageList = await deletePages(req.body.savedData.deletePages, newUrl)
            await addFileS3(updatedPageList, pageListUrl)
        }

        if (req.body.savedData.colors || req.body.savedData.fonts) {
            const globalStyles = createGlobalStylesheet(themeStyles, req.body.siteData.design.fonts)
            await addFileS3(globalStyles, `${newUrl}/global`, 'css')
        }

        /* if (req.body.savedData.fonts) {
            const globalStyles = createGlobalStylesheet(themeStyles, req.body.savedData.design.fonts)
            await addFileS3(globalStyles, `${newUrl}/global`, 'css')
        }
 */
        if (req.body.savedData.code) {
            const customStyles = createCustomStylesheet(req.body.savedData.code)
            await addFileS3(customStyles, `${newUrl}/custom`, 'css')
        }

        //Adding new siteData file after saved
        await addFileS3(req.body.siteData, `${newUrl}/siteData`)
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
        await addFileS3(globalFile, `${newUrl}/layout`)
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
        await addFileS3(req.body, `${newUrl}/siteData`)
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
