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
        if (value.backup.data) {
            value.backup.data.modules = transformCMSMods(value.backup.data.modules)
        }

        newData.push(value)
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
const addFilesS3 = async (data, pageList) => {
    const pages = data.pages
    //removing everything after first period from url for s3 storage
    newUrl = stripUrl(data.config.website.url)

    //adding page list file to s3
    addPageListS3(pageList, data, newUrl)

    //adding page files to s3
    addPagesS3(data.pages, data, newUrl)

    //add full site data to s3
    addSiteDataS3(data, newUrl)
}

const stripUrl = (url) => {
    return url.replace(/\..*/, '')
}

const addPageListS3 = async (pageList, data, newUrl) => {
    await s3
        .putObject({
            Body: JSON.stringify(pageList),
            Bucket: 'townsquareinteractive',
            Key: `${newUrl}/pages/page-list.json`,
        })
        .promise()

    console.log('Pagelist Placed')
}

const addPagesS3 = async (pages, data, newUrl) => {
    for (let i = 0; i < pages.length; i++) {
        await s3
            .putObject({
                Body: JSON.stringify(pages[i]),
                Bucket: 'townsquareinteractive',
                Key: `${newUrl}/pages/${pages[i].slug}.json`,
            })
            .promise()

        console.log('Page Placed')
    }
}
const addPageS3 = async (page, data) => {
    let newUrl = stripUrl(data.url)
    await s3
        .putObject({
            Body: JSON.stringify(page),
            Bucket: 'townsquareinteractive',
            Key: `${newUrl}/pages/${page.slug}.json`,
        })
        .promise()

    console.log('Page Placed')
}

const transformPageData = function (page) {
    if (page.backup.data) {
        page.backup.data.modules = transformCMSMods(page.backup.data.modules)
    }
    return page
}

const updatePageList = async (page, data) => {
    let newUrl = stripUrl(data.url)

    const params = {
        Bucket: 'townsquareinteractive',
        Key: `${newUrl}/pages/page-list.json`,
    }

    const newFile = await download()

    if (newFile.pages.filter((e) => e.Name === page.title).length === 0) {
        newFile.pages.push({
            name: page.title,
            slug: page.slug,
            id: page.id,
            page_type: page.page_type,
        })
        console.log(newFile)
    }

    async function download() {
        try {
            // Converted it to async/await syntax just to simplify.
            const data = await s3.getObject({ Bucket: 'townsquareinteractive', Key: `${newUrl}/pages/page-list.json` }).promise()

            // console.log(data)

            //console.log(data)
            return JSON.parse(data.Body.toString('utf-8'))
        } catch (err) {
            return {
                statusCode: err.statusCode || 400,
                body: err.message || JSON.stringify(err.message),
            }
        }
    }
}

const addSiteDataS3 = async (data) => {
    await s3
        .putObject({
            Body: JSON.stringify(data, newUrl),
            Bucket: 'townsquareinteractive',
            Key: `${newUrl}/siteData.json`,
        })
        .promise()
}

module.exports = {
    addFilesS3,
    transformCMSData,
    addPageS3,
    transformPageData,
    updatePageList,
}