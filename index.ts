import { config } from 'dotenv'
config()
import express from 'express'
import router from './api/cms-routes.js'
import path from 'path'
import { marked } from 'marked'
import * as fs from 'fs'

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
    const readmePath = path.join(process.cwd(), 'public', 'README.md')
    // Read README file
    fs.readFile(readmePath, 'utf-8', (err, data) => {
        if (err) {
            res.status(500).send('Error loading README')
            console.log('readme error', err)
            return
        }

        // Convert Markdown to HTML
        const readmeHTML = marked(data)
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>API Documentation</title>
                <style>
                    body { font-family: Arial, sans-serif; max-width: 800px; margin: auto; padding: 20px; background:#1e1e1e; color:#B1B1B1; font-size:18px; line-height:1.5; overflow-wrap: break-word; }
                    @media(min-width:700px){
                        body{ font-size:22px;}
                    }
                    h1, h2, h3 { color: #B1B1B1; font-size:20px; }
                    a{color:#fff;}
                    pre { background-color: #1e1e1e; padding: 10px; overflow: auto; }
                    code { background-color: #1e1e1e; padding: 2px 4px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { padding: 8px; border: 1px solid #ddd; text-align: left; }
                    th { background-color: #1e1e1e; }
                    
                </style>
            </head>
            <body>
                <h1>API Documentation</h1>
                ${readmeHTML}
            </body>
            </html>
        `)
    })
})

app.listen(PORT, () => console.log(`Server running in port ${PORT}`))
