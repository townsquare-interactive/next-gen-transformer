require('dotenv').config()
const AWS = require('aws-sdk')
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3')
/* const { getObjectCommand, S3Client } = require('aws-sdk') */

AWS.config.update({
    region: process.env.CMS_DEFAULT_REGION,
    accessKeyId: process.env.CMS_ACCESS_KEY_ID,
    secretAccessKey: process.env.CMS_SECRET_ACCESS_KEY_ID,
})

const s3 = new AWS.S3()

const transformCMSData = function (data) {
    let newData = []
    const pageListData = []
    for (const [key, value] of Object.entries(data.pages)) {
        //creating file for pagelist
        pageListData.push(createPageList(value))

        //transforming page data
        if (value.publisher.data.modules) {
            value.publisher.data.modules = transformCMSMods(value.publisher.data.modules)
            newData.push(value)
        } else if (value.backup.data) {
            value.backup.data.modules = transformCMSMods(value.backup.data.modules)
            newData.push(value)
        } else {
            newData.push(value)
        }
    }

    const pageList = { pages: pageListData }
    data.pages = newData

    //returned transformed whole page json and pagelist
    return { data: data, pageList: pageList }
}

const transformCMSMods = (pageData) => {
    let columnsData = []
    for (let i = 0; i <= pageData.length; ++i) {
        if (pageData[i]) {
            let newData = []

            for (const [key, value] of Object.entries(pageData[i])) {
                let modType

                if (value.type === 'article_1' || value.type === 'article_2' || value.type === 'article_3' || value.type === 'article') {
                    modType = 'MyArticle'
                }

                const modData = { ...value, modId: key }

                const newItem = { attributes: modData, componentType: modType }
                newData.push(newItem)
            }
            columnsData.push(newData)
        }
    }
    return columnsData
}

const createPageList = (value) => {
    const pageData = {
        name: value.title,
        slug: value.slug,
        id: value.id,
        page_type: value.page_type,
    }

    return pageData
}

//adding a page file for each page in cms data
const addFilesS3 = async (data, pageList, newUrl) => {
    const pages = data.pages

    //adding page list file to s3
    addFileS3(pageList, `${newUrl}/pages/page-list.json`)

    //adding page files to s3
    for (let i = 0; i < data.pages.length; i++) {
        addFileS3(data.pages[i], `${newUrl}/pages/${pages[i].slug}.json`)
    }

    //add full site data to s3
    addFileS3(data, `${newUrl}/siteData.json`)
}

const stripUrl = (url) => {
    return url.replace(/\..*/, '')
}

const transformPageData = function (page) {
    if (page.publisher) {
        page.publisher.data.modules = transformCMSMods(page.publisher.data.modules)
    }
    if (page.backup) {
        page.backup.data.modules = transformCMSMods(page.backup.data.modules)
    }
    if (page.modules) {
        page.modules = transformCMSMods(page.modules)
    }
    return page
}

const updatePageList = async (page, data) => {
    let newUrl = stripUrl(data.url)
    let pageListFile = await getFile()

    //check to see if pagelist exists
    s3.headObject({ Bucket: 'townsquareinteractive', Key: `${newUrl}/pages/page-list.json` }, function (err, metadata) {
        if (err && err.name === 'NotFound') {
            // Handle no object on cloud here
            console.log('page not found')
            pageListFile = { pages: [] }
            addPageToList()
            addFileS3(pageListFile, `${newUrl}/pages/page-list.json`)

            return false
        } else if (err) {
            // Handle other errors here....
            console.log(err.name)
            return false
        } else {
            // Do stuff with signedUrl
            addPageToList()
            addFileS3(pageListFile, `${newUrl}/pages/page-list.json`)
            return true
        }
    })

    //add page object to pagelist
    const addPageToList = () => {
        if (pageListFile.pages.filter((e) => e.name === page.title).length === 0) {
            pageListFile.pages.push({
                name: page.title,
                slug: page.slug,
                id: page.id,
                page_type: page.page_type,
            })
        }
    }

    async function getFile() {
        try {
            // Converted it to async/await syntax just to simplify.
            const data = await s3.getObject({ Bucket: 'townsquareinteractive', Key: `${newUrl}/pages/page-list.json` }).promise()

            return JSON.parse(data.Body.toString('utf-8'))
        } catch (err) {
            return {
                statusCode: err.statusCode || 400,
                body: err.message || JSON.stringify(err.message),
            }
        }
    }
}

//add any file, pass it the file and key for filename
const addFileS3 = async (file, key) => {
    await s3
        .putObject({
            Body: JSON.stringify(file),
            Bucket: 'townsquareinteractive',
            Key: key,
        })
        .promise()

    console.log('File Placed')
}

module.exports = {
    addFilesS3,
    transformCMSData,
    transformPageData,
    updatePageList,
    addFileS3,
    stripUrl,
}
