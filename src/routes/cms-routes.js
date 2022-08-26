const { transformCMSData, addFilesS3 } = require('../controllers/cms-controller')

const routes = (app) => {
    app.post('/pages', async (req, res) => {
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
}

module.exports = routes
