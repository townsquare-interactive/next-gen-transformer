import { config } from 'dotenv'
config()
import request from 'request-promise'
const tsiBucket = 'townsquareinteractive'
const bucketUrl = 'https://townsquareinteractive.s3.amazonaws.com'
import { S3 } from '@aws-sdk/client-s3'
import { ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3'
import { Readable } from 'stream'

interface DeleteFolderS3Res {
    status: 'fail' | 'success'
    message: string
}

const s3 = new S3({
    credentials: {
        accessKeyId: process.env.CMS_ACCESS_KEY_ID || '',
        //logger: console,
        secretAccessKey: process.env.CMS_SECRET_ACCESS_KEY_ID || '',
    },
    region: process.env.CMS_DEFAULT_REGION,
})

// Utility function to convert a Readable Stream to a string (needed for sdk v3)
const streamToString = (stream: Readable): Promise<string> => {
    return new Promise((resolve, reject) => {
        const chunks: any[] = []
        stream.on('data', (chunk) => chunks.push(chunk))
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
        stream.on('error', (error) => reject(error))
    })
}

//Get S3 object and return, if not found return passed object
export const getFileS3 = async (key: string, rtnObj: any = { pages: [] }, type = 'json') => {
    try {
        const data = await s3.getObject({ Bucket: tsiBucket, Key: key })

        if (data.Body) {
            // Convert the Readable Stream to a string
            const rawBody = await streamToString(data.Body as Readable)

            // If the content is JSON, return it directly
            try {
                const jsonData = JSON.parse(rawBody)
                return jsonData
            } catch (jsonError) {
                // If parsing as JSON fails, return the raw string
                console.log('Failed to parse as JSON. Returning raw string.')
                return rawBody
            }
        }
    } catch (err) {
        console.log(`File ${key} not found in S3`)
        return rtnObj
    }
}

/* export const fileExistsInS3 = async (key: string): Promise<boolean> => {
    try {
        await s3.headObject({ Bucket: tsiBucket, Key: key })
        return true // Object exists
    } catch (err) {
        if (err.code === 'NotFound') {
            console.log(`File ${key} not found in S3`)
            return false // Object does not exist
        }
        console.error(`Error checking if file ${key} exists in S3:`, err)
        throw err // Handle other errors
    }
} */

export const folderExistsInS3 = async (folderKey: string): Promise<boolean> => {
    try {
        const listObjectsResponse = await s3.listObjectsV2({
            Bucket: tsiBucket,
            Prefix: folderKey.endsWith('/') ? folderKey : folderKey + '/',
            MaxKeys: 1, // Only need to check if there is at least one object
        })

        return listObjectsResponse.Contents ? listObjectsResponse.Contents.length > 0 : false
    } catch (error) {
        console.error(`Error checking if folder ${folderKey} exists in S3:`, error)
        throw error // Handle other errors
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
    const fileUrl = `https://${tsiBucket}.s3.us-east-1.amazonaws.com/${encodeURIComponent(key + `.${fileType}`)}`
    return fileUrl
}

export const addImageToS3 = async (file: any, key: string) => {
    s3.putObject({
        Body: file,
        Key: key,
        Bucket: tsiBucket,
    }).catch((error) => {
        console.error(error)
    })

    const s3ImageUrl = `https://${tsiBucket}.s3.us-east-1.amazonaws.com/${encodeURIComponent(key)}`
    return s3ImageUrl
}

//add file to s3 bucket
export const addFolderS3 = async (file: any, key: string) => {
    await s3
        .putObject({
            Bucket: tsiBucket,
            Key: file + '/',
        })
        .catch((error) => {
            console.error(error)
        })

    console.log('S3 folder created')
}

//adds file from luna site to s3 folder (used for favicons)
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

export const deleteFolderS3 = async (folderKey: string): Promise<DeleteFolderS3Res> => {
    try {
        const listParams = {
            Bucket: tsiBucket,
            Prefix: folderKey,
        }

        const listedObjects = await s3.send(new ListObjectsV2Command(listParams))

        if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
            console.log('Folder is empty or does not exist')
            return { status: 'fail', message: 'S3 Folder does not exist, ' + folderKey }
        }

        // Delete all files within the folder
        const deleteParams = {
            Bucket: tsiBucket,
            Delete: {
                Objects: listedObjects.Contents.map(({ Key }) => ({ Key })),
                Quiet: true,
            },
        }

        await s3.send(new DeleteObjectsCommand(deleteParams))

        console.log('S3 Folder Deleted', folderKey)

        return { status: 'success', message: 'S3 Folder Deleted ' + folderKey }
    } catch (err) {
        throw err
    }
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
