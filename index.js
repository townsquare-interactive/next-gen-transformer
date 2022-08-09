const express = require('express')
const routes = require('./api/characters')
require('dotenv').config()

const app = express()

/* app.use(express.json())
 */

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
