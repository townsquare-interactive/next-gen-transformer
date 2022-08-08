const express = require('express')
const routes = require('./api/characters')
/* const characters = require('./api/characters') */
const AWS = require('aws-sdk')
require('dotenv').config()

AWS.config.update({
    region: process.env.AWS_DEFAULT_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
})

const app = express()

/* app.use(express.json()) */

app.use(express.json({ extended: true }))

/* app.use('/api/', characters) */

routes(app)

app.get('/', (req, res) => {
    res.send('Welcome to the Harry Potter character API')
})

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`listening on port ${port}`)
})
