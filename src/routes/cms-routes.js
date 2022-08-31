const { transformCMSData, addFilesS3, transformPageData, updatePageList, addFileS3, stripUrl } = require('../controllers/cms-controller')

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
            updatePageList(req.body.page, req.body.data)
            addFileS3(newPageData, `${newUrl}/pages/${newPageData.slug}.json`)

            res.json(JSON.stringify('page added'))
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
