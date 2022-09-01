const express = require('express')
require('dotenv').config()

//Determinging which database to use
let routes
if (process.env.DB == 'dynamo') {
    routes = require('./src/routes/dynamo-routes')
} else if (process.env.DB == 'mongo') {
    routes = require('./src/routes/mongo-routes')
} else if (process.env.DB == 'cms') {
    routes = require('./src/routes/cms-routes')
}

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

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }))

routes(app)

app.get('/', (req, res) => {
    res.send(`Welcome to the my API using ${process.env.DB == 'dynamo' ? 'Dynamo' : process.env.DB == 'mongo' ? 'Mongo' : 'cms'}`)
})

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`listening on port ${port}`)
})
