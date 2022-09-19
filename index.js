require('dotenv').config()
const express = require('express')
const app = express()
const cms = require('./api/cms-routes')

app.use(express.json({ limit: '80mb' }))
app.use(express.urlencoded({ limit: '80mb', extended: false, parameterLimit: 5000000 }))

app.use('/api/cms-routes', cms)

const PORT = process.env.PORT || 8080

app.get('/', (req, res) => {
    res.send(`new API`)
})

app.listen(PORT, () => console.log(`Server running in port ${PORT}`))
