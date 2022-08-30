const { transformCMSData, addFilesS3, addPageS3, transformPageData, updatePageList } = require('../controllers/cms-controller')

const routes = (app) => {
    app.post('/cms', async (req, res) => {
        const newData = transformCMSData(req.body)

        try {
            addFilesS3(newData.data, newData.pageList)

            /* res.json(newData) */
            res.json('All Files added')
        } catch (err) {
            console.error(err)
            res.status(500).json({ err: 'Something went wrong' })
        }
    })

    app.post('/page', async (req, res) => {
        const newPageData = transformPageData(req.body.page)
        const pageList = updatePageList(req.body.page, req.body.data)

        try {
            addPageS3(newPageData, req.body.data)

            /* res.json(newData) */
            res.json(JSON.stringify(pageList))
        } catch (err) {
            console.error(err)
            res.status(500).json({ err: 'Something went wrong' })
        }
    })
}

module.exports = routes
