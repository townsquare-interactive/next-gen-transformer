import { config } from 'dotenv'
config()
import express from 'express'
import router from './api/cms-routes.js'

const app = express()
const routes = router

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

const PORT = 8080

app.get('/', (req, res) => {
    res.send(`API Running ${PORT}`)
})

app.listen(PORT, () => console.log(`Server running in port ${PORT}`))
