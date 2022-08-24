require('dotenv').config()
const AWS = require('aws-sdk')
AWS.config.update({
    region: process.env.CMS_DEFAULT_REGION,
    accessKeyId: process.env.CMS_ACCESS_KEY_ID,
    secretAccessKey: process.env.CMS_SECRET_ACCESS_KEY_ID,
})

const s3 = new AWS.S3()

const transformPage = (pageData) => {
    let newData = []

    for (const [key, value] of Object.entries(pageData)) {
        let modType

        if (value.type === 'article_1' || value.type === 'article_2' || value.type === 'article_3' || value.type === 'article') {
            modType = 'MyArticle'
        }

        const modData = { ...value, modId: key }

        const newItem = { attributes: modData, componentType: modType }
        newData.push(newItem)
    }
    return newData
}

const transformWhole = function (data) {
    let newData = []
    const pageList = []
    for (const [key, value] of Object.entries(data.pages)) {
        //creating file for pagelist
        const pageData = {
            name: value.title,
            slug: value.slug,
            id: value.id,
            page_type: value.page_type,
        }
        pageList.push(pageData)

        //transforming page data
        if (value.backup.data) {
            const columnsData = []
            for (let i = 0; i <= 4; ++i) {
                columnsData.push(transformPage(value.backup.data.modules[i]))
            }

            value.backup.data.modules = columnsData
        }

        newData.push(value)
    }
    data.pages = newData

    //pagelist file, need to return later

    //returned transformed whole page json
    return { data: data, pageList: pageList }
}

//adding a page file for each page in cms data
const addFile = async (data, pageList) => {
    const pages = data.pages

    console.log('pagelist', pageList)

    await s3
        .putObject({
            Body: JSON.stringify(pageList),
            Bucket: 'townsquareinteractive',
            Key: `${data.config.website.url}/pages/page-list.json`,
        })
        .promise()

    console.log('Pagelist Placed')

    for (let i = 0; i < pages.length; i++) {
        await s3
            .putObject({
                Body: JSON.stringify(pages[i]),
                Bucket: 'townsquareinteractive',
                Key: `${data.config.website.url}/pages/${pages[i].slug}.json`,
            })
            .promise()

        console.log('Page Placed')
    }
}

//deletes file
const deleteFile = async () => {
    await s3
        .deleteObject({
            Bucket: 'townsquaretest',
            Key: 'test.json',
        })
        .promise()
    console.log('File Delete')
}

module.exports = {
    addFile,
    deleteFile,
    transformWhole,
}

//transformWhole(cmsWhole)
