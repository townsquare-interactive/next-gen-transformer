const express = require('express')
const characters = require('./api/characters')

const app = express()

/* app.use(express.json()) */

app.use(express.json({ extended: false }))

app.use('/api/', characters)

//each of these are endpoints
//view localhost:3000/characters

app.get('/', (req, res) => {
    res.send('Welcome to the Harry Potter character API')
})

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`listening on port ${port}`)
})
