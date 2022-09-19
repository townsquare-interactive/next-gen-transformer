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

router.post('/cms', async (req, res) => {
    const newUrl = stripUrl(req.body.config.website.url)

    try {
        addFileS3(req.body, `${newUrl}/siteData.json`)
        res.json('Site Data added')
    } catch (err) {
        console.error(err)
        res.status(500).json({ err: 'Something went wrong' })
    }
})

router.post('/page', async (req, res) => {
    const newPageData = transformPageData(req.body.page)
    const newUrl = stripUrl(req.body.data.url)

    try {
        updatePageList(req.body.page, newUrl)
        addFileS3(newPageData, `${newUrl}/pages/${newPageData.slug}.json`)

        res.json(JSON.stringify('page added'))
    } catch (err) {
        console.error(err)
        res.status(500).json({ err: 'Something went wrong' })
    }
})

//chnage to save data
router.post('/pages', async (req, res) => {
    const url = req.body.siteConfig.url
    newUrl = stripUrl(url)

    const newPageData = transformPagesData(req.body.savedData.pages, req.body.allPages)

    try {
        addFileS3(req.body, `${newUrl}/cmsSave.json`) //debugging passed data
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

//used for debugging
router.post('/test', async (req, res) => {
    try {
        const url = req.body.siteConfig.url
        newUrl = stripUrl(url)
        await addFileS3(req.body, `${newUrl}/testSave.json`) //debugging passed data

        res.json(newUrl)
    } catch (err) {
        console.error(err)
        console.log('did not work')
        res.status(500).json({ err: 'Something went wrong' })
    }
})

router.post('/sitedata', async (req, res) => {
    const newUrl = req.body.siteData.url

    try {
        addFileS3(req.body, `${newUrl}/siteData.json`)
        //save each page

        res.json(req.body)
    } catch (err) {
        console.error(err)
        res.status(500).json({ err: 'Something went wrong' })
    }
})

router.post('/migrate', async (req, res) => {
    const newData = transformCMSData(req.body)
    const newUrl = stripUrl(req.body.config.website.url)

    try {
        addMultipleS3(newData.data, newData.pageList, newUrl)
        res.json('All Files added')
    } catch (err) {
        console.error(err)
        res.status(500).json({ err: 'Something went wrong' })
    }
})

/* const routes = (app) => {
    app.post('/cms', async (req, res) => {
        const newUrl = stripUrl(req.body.config.website.url)

        try {
            addFileS3(req.body, `${newUrl}/siteData.json`)
            res.json('Site Data added')
        } catch (err) {
            console.error(err)
            res.status(500).json({ err: 'Something went wrong' })
        }
    })

    app.post('/page', async (req, res) => {
        const newPageData = transformPageData(req.body.page)
        const newUrl = stripUrl(req.body.data.url)

        try {
            updatePageList(req.body.page, newUrl)
            addFileS3(newPageData, `${newUrl}/pages/${newPageData.slug}.json`)

            res.json(JSON.stringify('page added'))
        } catch (err) {
            console.error(err)
            res.status(500).json({ err: 'Something went wrong' })
        }
    })

    //chnage to save data
    app.post('/pages', async (req, res) => {
        const url = req.body.siteConfig.url
        newUrl = stripUrl(url)

        const newPageData = transformPagesData(req.body.savedData.pages, req.body.allPages)

        try {
            addFileS3(req.body, `${newUrl}/cmsSave.json`) //debugging passed data
            //save each page
            for (let i = 0; i < newPageData.pages.length; i++) {
                addFileS3(newPageData.pages[i], `${newUrl}/pages/${newPageData.pages[i].data.slug}.json`)
            }
            updatePageList(newPageData.pages, newUrl)
            res.json(newUrl)
        } catch (err) {
            console.error(err)
            res.status(500).json({ err: 'Something went wrong' })
        }
    })

    app.post('/test', async (req, res) => {
        try {
            const url = req.body.siteConfig.url
            newUrl = stripUrl(url)
            addFileS3(req.body, `${newUrl}/testSave.json`) //debugging passed data

            res.json(newUrl)
        } catch (err) {
            console.error(err)
            console.log('did not work')
            res.status(500).json({ err: 'Something went wrong' })
        }
    })

    app.post('/sitedata', async (req, res) => {
        const newUrl = req.body.siteData.url

        try {
            addFileS3(req.body, `${newUrl}/siteData.json`)
            //save each page

            res.json(req.body)
        } catch (err) {
            console.error(err)
            res.status(500).json({ err: 'Something went wrong' })
        }
    })

    app.post('/migrate', async (req, res) => {
        const newData = transformCMSData(req.body)
        const newUrl = stripUrl(req.body.config.website.url)

        try {
            addMultipleS3(newData.data, newData.pageList, newUrl)
            res.json('All Files added')
        } catch (err) {
            console.error(err)
            res.status(500).json({ err: 'Something went wrong' })
        }
    })
} */

module.exports = router
