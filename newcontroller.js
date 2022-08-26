require('dotenv').config()
const AWS = require('aws-sdk')
AWS.config.update({
    region: process.env.CMS_DEFAULT_REGION,
    accessKeyId: process.env.CMS_ACCESS_KEY_ID,
    secretAccessKey: process.env.CMS_SECRET_ACCESS_KEY_ID,
})

const s3 = new AWS.S3()

const transformWhole = function (data) {
    let newData = []
    const pageListData = []
    for (const [key, value] of Object.entries(data.pages)) {
        pageListData.push(createPageList(value))

        //transforming page data
        if (value.backup.data) {
            /*             console.log('page before', value.backup.data.modules)
            console.log('page transformed', transformPage(value.backup.data.modules)) */
            value.backup.data.modules = transformPage(value.backup.data.modules)
        }

        newData.push(value)
        console.log(newData)
    }

    const pageList = { pages: pageListData }
    data.pages = newData

    /*    console.log(data.pages.backup ? data.pages.backup.data.modules : '') */

    //returned transformed whole page json
    return { data: data, pageList: pageList }
}

const transformPage = (pageMods) => {
    const columnsData = []
    for (let i = 0; i <= 4; i++) {
        //new function
        let newData = []
        for (const [key, value] of Object.entries(pageMods[i])) {
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
const addFile = async (data, pageList) => {
    const pages = data.pages

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

    await s3
        .putObject({
            Body: JSON.stringify(data),
            Bucket: 'townsquareinteractive',
            Key: `${data.config.website.url}/siteData.json`,
        })
        .promise()
}

//deletes file
/* const deleteFile = async () => {
    await s3
        .deleteObject({
            Bucket: 'townsquaretest',
            Key: 'test.json',
        })
        .promise()
    console.log('File Delete')
} */

module.exports = {
    addFile,
    transformWhole,
}
