const express = require('express')
const routes = require('./src/routes/routes')
require('dotenv').config()

const app = express()
/*
 app.use(express.json())
 */

/* app.use('/api/', characters) */

app.use(express.json({ extended: false }))

routes(app)

process.env.DYN_DEFAULT_REGION ? console.log('yes') : console.log('no')

app.get('/', (req, res) => {
    res.send('Welcome to the Harry Potter character API')
})

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`listening on port ${port}`)
})
