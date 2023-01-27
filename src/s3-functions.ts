require('dotenv').config()
const request = require('request-promise')
const tsiBucket = 'townsquareinteractive'
const bucketUrl = 'https://townsquareinteractive.s3.amazonaws.com'

const AWS = require('aws-sdk')

AWS.config.update({
    region: process.env.CMS_DEFAULT_REGION,
    accessKeyId: process.env.CMS_ACCESS_KEY_ID,
    secretAccessKey: process.env.CMS_SECRET_ACCESS_KEY_ID,
    //logger: console,
})
const s3 = new AWS.S3()

//Get S3 object and return, if not found return passed object
const getFileS3 = async (key, rtnObj = { pages: [] }, type = 'json') => {
    if (type === 'json') {
        try {
            const data = await s3.getObject({ Bucket: tsiBucket, Key: key }).promise()
            return type === 'json' ? JSON.parse(data.Body.toString('utf-8')) : data.Body.toString('utf-8')
        } catch (err) {
            console.log('file  not found in S3, creating new file')
            return rtnObj
        }
    } else {
        try {
            const data = await s3.getObject({ Bucket: tsiBucket, Key: key })
            console.log(key)
            return data.Body.toString('utf-8')
        } catch (err) {
            console.log('css file not in s3')
            return rtnObj
        }
    }
}

//add file to s3 bucket
const addFileS3 = async (file, key, fileType = 'json') => {
    const s3ContentType = fileType.includes('css') ? 'text/css' : 'application/json'
    const body = fileType === 'json' ? JSON.stringify(file) : file

    await s3
        .putObject({
            Body: body,
            Bucket: tsiBucket,
            Key: key + `.${fileType}`,
            ContentType: s3ContentType,
        })
        .promise()
        .catch((error) => {
            console.error(error)
        })

    console.log('File Placed')
}

const addAssetFromSiteToS3 = async (file, key) => {
    var options = {
        uri: 'http://' + file,
        encoding: null,
    }
    request(options, function (error, response, body) {
        if (error || response.statusCode !== 200) {
            console.log('failed to get image')
            console.log(error)
        } else {
            s3.putObject(
                {
                    Body: body,
                    Key: key,
                    Bucket: tsiBucket,
                },
                function (error, data) {
                    if (error) {
                        console.log('error downloading image to s3')
                    } else {
                        console.log('success uploading to s3')
                    }
                }
            )
        }
    })
}

//adding a page file for each page in cms data
const addMultipleS3 = async (data, pageList, basePath) => {
    const pages = data.pages

    //adding page list file to s3
    addFileS3(pageList, `${basePath}/pages/page-list`)

    //adding page files to s3
    for (let i = 0; i < data.pages.length; i++) {
        addFileS3(data.pages[i], `${basePath}/pages/${pages[i].slug}`)
    }

    //add full site data to s3
    addFileS3(data, `${basePath}/siteData`)
}

//add any file, pass it the file and key for filename
const addFileS3List = async (file, key) => {
    //console.log('File to be added', file)

    await s3
        .putObject({
            Body: JSON.stringify(file),
            Bucket: tsiBucket,
            Key: key,
        })
        .promise()

    console.log('S3 File Added')
}

const deleteFileS3 = async (key) => {
    console.log('File to be deleted', key)

    await s3
        .deleteObject({
            Bucket: tsiBucket,
            Key: key,
        })
        .promise()

    console.log('S3 File Deleted')
}

const getCssFile = async (pageSlug, basePath) => {
    var options = {
        uri: `${bucketUrl}/${basePath}/styles/${pageSlug}.scss`,
        encoding: null,
    }

    let cssFile
    await request(options, function (error, response, body) {
        if (error || response.statusCode !== 200) {
            console.log('failed to get file')
            cssFile = ''
        } else {
            cssFile = body.toString('utf-8')
        }
    })
    return cssFile
}

module.exports = {
    addMultipleS3,
    addFileS3,
    addAssetFromSiteToS3,
    getFileS3,
    getCssFile,
    addFileS3List,
    deleteFileS3,
}
