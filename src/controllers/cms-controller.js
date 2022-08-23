require('dotenv').config()
const AWS = require('aws-sdk')
AWS.config.update({
    region: process.env.DYN_DEFAULT_REGION,
    accessKeyId: process.env.DYN_ACCESS_KEY_ID,
    secretAccessKey: process.env.DYN_SECRET_ACCESS_KEY_ID,
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
    for (const [key, value] of Object.entries(data.pages)) {
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
    return data
}

//adding a page file for each page in cms data
const addFile = async (data) => {
    const pages = data.pages

    for (let i = 0; i < pages; i++) {
        await s3
            .putObject({
                data: JSON.stringify(pages[i]),
                Bucket: 'townsquaretest',
                Key: `${pages[i].slug}json`,
            })
            .promise()
        console.log('Object Placed')
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
