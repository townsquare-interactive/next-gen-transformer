require('dotenv').config()
const AWS = require('aws-sdk')
AWS.config.update({
    region: process.env.CMS_DEFAULT_REGION,
    accessKeyId: process.env.CMS_ACCESS_KEY_ID,
    secretAccessKey: process.env.CMS_SECRET_ACCESS_KEY_ID,
})

const test = [
    {
        name: 'test',
        goal: 's3',
    },
    {
        name: 'obj2',
        goal: 'again',
    },
]

const s3 = new AWS.S3()

//ads file or replaces if already exists
const addFile = async () => {
    await s3
        .putObject({
            Body: JSON.stringify(test),
            Bucket: 'townsquareinteractive',
            Key: 'test.json',
        })
        .promise()
    console.log('Object Placed')
}

//deletes file
const deleteFile = async () => {
    await s3
        .deleteObject({
            Bucket: '',
            Key: 'test.json',
        })
        .promise()
    console.log('File Delete')
}

addFile()
