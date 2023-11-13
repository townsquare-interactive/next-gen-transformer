import { config } from 'dotenv'
config()
import request from 'request-promise'
const tsiBucket = 'townsquareinteractive'
const bucketUrl = 'https://townsquareinteractive.s3.amazonaws.com'
import AWS from 'aws-sdk'
import { S3 } from '@aws-sdk/client-s3'

// JS SDK v3 does not support global configuration.
// Codemod has attempted to pass values to each service client in this file.
// You may need to update clients outside of this file, if they use global config.
// JS SDK v3 does not support global configuration.
// Codemod has attempted to pass values to each service client in this file.
// You may need to update clients outside of this file, if they use global config.
AWS.config.update({
    region: process.env.CMS_DEFAULT_REGION,
    accessKeyId: process.env.CMS_ACCESS_KEY_ID,
    secretAccessKey: process.env.CMS_SECRET_ACCESS_KEY_ID,
    //logger: console,
})
const s3 = new S3({
    credentials: {
        accessKeyId: process.env.CMS_ACCESS_KEY_ID || '',
        //logger: console,
        secretAccessKey: process.env.CMS_SECRET_ACCESS_KEY_ID || '',
    },
    region: process.env.CMS_DEFAULT_REGION,
})

//Get S3 object and return, if not found return passed object
export const getFileS3 = async (key: string, rtnObj: any = { pages: [] }, type = 'json') => {
    try {
        const data = await s3.getObject({ Bucket: tsiBucket, Key: key })

        if (data.Body) {
            console.log('body has been found')
            console.log('here body', data.Body)
            return JSON.parse(data.Body.toString())
        }
    } catch (err) {
        console.log(`file ${key} not found in S3, creating new file`, err)
        return rtnObj
    }
}

//add file to s3 bucket
export const addFileS3 = async (file: any, key: string, fileType = 'json') => {
    const s3ContentType = fileType.includes('css') ? 'text/css' : 'application/json'
    const body = fileType === 'json' ? JSON.stringify(file) : file

    await s3
        .putObject({
            Body: body,
            Bucket: tsiBucket,
            Key: key + `.${fileType}`,
            ContentType: s3ContentType,
        })
        .catch((error) => {
            console.error(error)
        })

    console.log('File Placed')
}

export const addAssetFromSiteToS3 = async (file: any, key: string) => {
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
                function (error: any, data: any) {
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
export const addMultipleS3 = async (data: any, pageList: { pages: [] }, basePath: string) => {
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

export const moveAllS3Objs = async () => {
    /* await s3.listObjects({Prefix: ''}, function(err, data) {
    if (data.Contents.length) {
      async.each(data.Contents, function(file, cb) {
        var params = {
          Bucket: bucketName,
          CopySource: bucketName + '/' + file.Key,
          Key: file.Key.replace(oldPrefix, newPrefix)
        };
        s3.copyObject(params, function(copyErr, copyData){
          if (copyErr) {
            console.log(copyErr);
          }
          else {
            console.log('Copied: ', params.Key);
            cb();
          }
        });
      }, done);
    }
  }); */
    /*  console.log('tring to do S3 all bucket')
    const listObjectsResponse = await s3
        .listObjectsV2({
            Bucket: 'townsquareinteractive',
            Prefix: 'wanderlustadventures',
            Delimiter: '/',
        })
        .promise()

    const folderContentInfo = listObjectsResponse.Contents
    const folderPrefix = listObjectsResponse.Prefix

    console.log(listObjectsResponse) */
    /*     const params = {
        Bucket: 'townsquareinteractive',
        Prefix: 'wanderlustadventures',
    }

    const listAllKeys = (params, out = []) =>
        new Promise((resolve, reject) => {
            s3.listObjectsV2(params)
                .promise()
                .then(({ Contents, IsTruncated, NextContinuationToken }) => {
                    out.push(...Contents)
                    !IsTruncated ? resolve(out) : resolve(listAllKeys(Object.assign(params, { ContinuationToken: NextContinuationToken }), out))
                })
                .catch(reject)
        })

    listAllKeys({ Bucket: 'bucket-name' }).then(console.log).catch(console.log) */
}

//add any file, pass it the file and key for filename
export const addFileS3List = async (file: any, key: string) => {
    //console.log('File to be added', file)

    await s3.putObject({
        Body: JSON.stringify(file),
        Bucket: tsiBucket,
        Key: key,
    })

    console.log('S3 File Added')
}

export const deleteFileS3 = async (key: string) => {
    console.log('File to be deleted', key)

    await s3.deleteObject({
        Bucket: tsiBucket,
        Key: key,
    })

    console.log('S3 File Deleted')
}

export const getCssFile = async (pageSlug: string, basePath: string) => {
    var options = {
        uri: `${bucketUrl}/${basePath}/styles/${pageSlug}.scss`,
        encoding: null,
    }

    let cssFile
    try {
        await request(options, function (error, response, body) {
            cssFile = body.toString('utf-8')
            /*  if (error || response.statusCode !== 200) {
            console.log('failed to get css file')
            cssFile = ''
        } else {
            cssFile = body.toString('utf-8')
        } */
        })
    } catch (err) {
        console.log('error getting css page')
        return ''
    }
    return cssFile
}
