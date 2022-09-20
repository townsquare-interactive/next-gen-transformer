require('dotenv').config()
const express = require('express')
const app = express()

let routes
if (process.env.DB == 'dynamo') {
    routes = require('./api/dynamo-routes')
} else if (process.env.DB == 'mongo') {
    routes = require('./api/mongo-routes')
} else if (process.env.DB == 'cms') {
    routes = require('./api/cms-routes')
}

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

app.use(express.json({ limit: '80mb' }))
app.use(express.urlencoded({ limit: '80mb', extended: true, parameterLimit: 5000000 }))

app.use('/api/cms-routes', routes)

const PORT = process.env.PORT || 8080

app.get('/', (req, res) => {
    res.send(`API Running CMS`)
})

app.listen(PORT, () => console.log(`Server running in port ${PORT}`))
