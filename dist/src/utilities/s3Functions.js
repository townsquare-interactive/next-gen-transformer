import { config } from 'dotenv';
config();
import request from 'request-promise';
const tsiBucket = 'townsquareinteractive';
const bucketUrl = 'https://townsquareinteractive.s3.amazonaws.com';
import { S3 } from '@aws-sdk/client-s3';
import { ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { NodeHttpHandler } from '@smithy/node-http-handler';
import { Agent as HttpAgent } from 'http';
const s3 = new S3({
    credentials: {
        accessKeyId: process.env.CMS_ACCESS_KEY_ID || '',
        //logger: console,
        secretAccessKey: process.env.CMS_SECRET_ACCESS_KEY_ID || '',
    },
    region: process.env.CMS_DEFAULT_REGION,
    requestHandler: new NodeHttpHandler({
        socketTimeout: 3000,
        httpAgent: new HttpAgent({ keepAlive: true, maxSockets: 300 }),
        // socketAcquisitionTimeoutMs: 10000
    }),
});
// Utility function to convert a Readable Stream to a string (needed for sdk v3)
const streamToString = (stream) => {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
        stream.on('error', (error) => reject(error));
    });
};
//Get S3 object and return, if not found return passed object
export const getFileS3 = async (key, rtnObj = { pages: [] }, type = 'json') => {
    try {
        const data = await s3.getObject({ Bucket: tsiBucket, Key: key });
        if (data.Body) {
            // Convert the Readable Stream to a string
            const rawBody = await streamToString(data.Body);
            // If the content is JSON, return it directly
            try {
                const jsonData = JSON.parse(rawBody);
                return jsonData;
            }
            catch (jsonError) {
                // If parsing as JSON fails, return the raw string
                console.log('Failed to parse as JSON. Returning raw string.');
                return rawBody;
            }
        }
    }
    catch (err) {
        console.log(`File ${key} not found in S3`);
        return rtnObj;
    }
};
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
export const folderExistsInS3 = async (folderKey) => {
    try {
        const listObjectsResponse = await s3.listObjectsV2({
            Bucket: tsiBucket,
            Prefix: folderKey.endsWith('/') ? folderKey : folderKey + '/',
            MaxKeys: 1, // Only need to check if there is at least one object
        });
        return listObjectsResponse.Contents ? listObjectsResponse.Contents.length > 0 : false;
    }
    catch (error) {
        console.error(`Error checking if folder ${folderKey} exists in S3:`, error);
        throw error; // Handle other errors
    }
};
//add file to s3 bucket
export const addFileS3 = async (file, key, fileType = 'json') => {
    const s3ContentType = fileType.includes('css') ? 'text/css' : 'application/json';
    const body = fileType === 'json' ? JSON.stringify(file) : file;
    await s3
        .putObject({
        Body: body,
        Bucket: tsiBucket,
        Key: key + `.${fileType}`,
        ContentType: s3ContentType,
    })
        .catch((error) => {
        console.error(error);
    });
    console.log('File Placed');
};
export const addImageToS3 = async (file, key) => {
    s3.putObject({
        Body: file,
        Key: key,
        Bucket: tsiBucket,
    }).catch((error) => {
        console.error(error);
    });
    const s3ImageUrl = `https://${tsiBucket}.s3.us-east-1.amazonaws.com/${encodeURIComponent(key)}`;
    return s3ImageUrl;
};
//add file to s3 bucket
export const addFolderS3 = async (file, key) => {
    await s3
        .putObject({
        Bucket: tsiBucket,
        Key: file + '/',
    })
        .catch((error) => {
        console.error(error);
    });
    console.log('S3 folder created');
};
//adds file from luna site to s3 folder (used for favicons)
export const addAssetFromSiteToS3 = async (file, key) => {
    var options = {
        uri: 'http://' + file,
        encoding: null,
    };
    request(options, function (error, response, body) {
        if (error || response.statusCode !== 200) {
            console.log('failed to get image');
            console.log(error);
        }
        else {
            s3.putObject({
                Body: body,
                Key: key,
                Bucket: tsiBucket,
            }, function (error, data) {
                if (error) {
                    console.log('error downloading image to s3');
                }
                else {
                    console.log('success uploading to s3');
                }
            });
        }
    });
};
//adding a page file for each page in cms data
export const addMultipleS3 = async (data, pageList, basePath) => {
    const pages = data.pages;
    //adding page list file to s3
    addFileS3(pageList, `${basePath}/pages/page-list`);
    //adding page files to s3
    for (let i = 0; i < data.pages.length; i++) {
        addFileS3(data.pages[i], `${basePath}/pages/${pages[i].slug}`);
    }
    //add full site data to s3
    addFileS3(data, `${basePath}/siteData`);
};
export const deleteFolderS3 = async (folderKey) => {
    try {
        const listParams = {
            Bucket: tsiBucket,
            Prefix: folderKey,
        };
        const listedObjects = await s3.send(new ListObjectsV2Command(listParams));
        if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
            console.log('Folder is empty or does not exist');
            return { status: 'fail', message: 'S3 Folder does not exist, ' + folderKey };
        }
        // Delete all files within the folder
        const deleteParams = {
            Bucket: tsiBucket,
            Delete: {
                Objects: listedObjects.Contents.map(({ Key }) => ({ Key })),
                Quiet: true,
            },
        };
        await s3.send(new DeleteObjectsCommand(deleteParams));
        console.log('S3 Folder Deleted', folderKey);
        return { status: 'success', message: 'S3 Folder Deleted ' + folderKey };
    }
    catch (err) {
        throw err;
    }
};
export const deleteFileS3 = async (key) => {
    console.log('File to be deleted', key);
    await s3.deleteObject({
        Bucket: tsiBucket,
        Key: key,
    });
    console.log('S3 File Deleted');
};
export const getCssFile = async (pageSlug, basePath) => {
    var options = {
        uri: `${bucketUrl}/${basePath}/styles/${pageSlug}.scss`,
        encoding: null,
    };
    let cssFile;
    try {
        await request(options, function (error, response, body) {
            cssFile = body.toString('utf-8');
            /*  if (error || response.statusCode !== 200) {
            console.log('failed to get css file')
            cssFile = ''
        } else {
            cssFile = body.toString('utf-8')
        } */
        });
    }
    catch (err) {
        console.log('error getting css page');
        return '';
    }
    return cssFile;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiczNGdW5jdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdXRpbGl0aWVzL3MzRnVuY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxRQUFRLENBQUE7QUFDL0IsTUFBTSxFQUFFLENBQUE7QUFDUixPQUFPLE9BQU8sTUFBTSxpQkFBaUIsQ0FBQTtBQUNyQyxNQUFNLFNBQVMsR0FBRyx1QkFBdUIsQ0FBQTtBQUN6QyxNQUFNLFNBQVMsR0FBRyxnREFBZ0QsQ0FBQTtBQUNsRSxPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sb0JBQW9CLENBQUE7QUFDdkMsT0FBTyxFQUFFLG9CQUFvQixFQUFFLG9CQUFvQixFQUFFLE1BQU0sb0JBQW9CLENBQUE7QUFFL0UsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDJCQUEyQixDQUFBO0FBQzNELE9BQU8sRUFBRSxLQUFLLElBQUksU0FBUyxFQUFFLE1BQU0sTUFBTSxDQUFBO0FBT3pDLE1BQU0sRUFBRSxHQUFHLElBQUksRUFBRSxDQUFDO0lBQ2QsV0FBVyxFQUFFO1FBQ1QsV0FBVyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLElBQUksRUFBRTtRQUNoRCxrQkFBa0I7UUFDbEIsZUFBZSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLElBQUksRUFBRTtLQUM5RDtJQUNELE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQjtJQUN0QyxjQUFjLEVBQUUsSUFBSSxlQUFlLENBQUM7UUFDaEMsYUFBYSxFQUFFLElBQUk7UUFDbkIsU0FBUyxFQUFFLElBQUksU0FBUyxDQUFDLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFDOUQsb0NBQW9DO0tBQ3ZDLENBQUM7Q0FDTCxDQUFDLENBQUE7QUFFRixnRkFBZ0Y7QUFDaEYsTUFBTSxjQUFjLEdB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