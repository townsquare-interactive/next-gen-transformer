const { transformCMSData, addFilesS3, transformPageData, updatePageList, addFileS3, stripUrl, transformPagesData } = require('../controllers/cms-controller')

const routes = (app) => {
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

    app.post('/pages', async (req, res) => {
        const url = req.body.fullData.config.website.url
        cutProtocol = url.replace(/(^\w+:|^)\/\//, '')
        newUrl = stripUrl(cutProtocol)

        /* const newUrl = req.url */
        const newPageData = transformPagesData(req.body.pageData, req.body.fullData)

        try {
            addFileS3(req.body, `${newUrl}/cmsSave.json`)
            //save each page
            updatePageList(newPageData.pages, newUrl)
            for (let i = 0; i < newPageData.pages.length; i++) {
                //updatePageList(newPageData.pages[i].data, newUrl)
                addFileS3(newPageData.pages[i], `${newUrl}/pages/${newPageData.pages[i].data.slug}.json`)
            }
            res.json(newUrl)
        } catch (err) {
            console.error(err)
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
            addFilesS3(newData.data, newData.pageList, newUrl)
            res.json('All Files added')
        } catch (err) {
            console.error(err)
            res.status(500).json({ err: 'Something went wrong' })
        }
    })
}

module.exports = routes
