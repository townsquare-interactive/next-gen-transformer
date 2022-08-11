const express = require('express')
const routes = require('./src/routes/routes')
require('dotenv').config()

const app = express()

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')

    // authorized headers for preflight requests
    // https://developer.mozilla.org/en-US/docs/Glossary/preflight_request
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    next()

    app.options('*', (req, res) => {
        // allowed XHR methods
        res.header('Access-Control-Allow-Methods', 'GET, PATCH, PUT, POST, DELETE, OPTIONS')
        res.send()
    })
})
/*
 app.use(express.json())
 */
//check

//now

/* app.use('/api/', characters) */

app.use(express.json({ extended: false }))

routes(app)

app.get('/', (req, res) => {
    /* res.send(`Welcome to the Harry Potter character API ${process.env.DYN_SECRET_ACCESS_KEY_ID === '5eiB/h4bnlodJMJE55bq1V+qfmRCLxlbal9oD6gv' ? 'yes' : 'no'}`) */
    res.send(`Welcome to the Harry Potter character API`)
})

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`listening on port ${port}`)
})
