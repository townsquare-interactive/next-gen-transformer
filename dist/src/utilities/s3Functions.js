import { config } from 'dotenv';
config();
import request from 'request-promise';
const tsiBucket = 'townsquareinteractive';
const bucketUrl = 'https://townsquareinteractive.s3.amazonaws.com';
import { S3 } from '@aws-sdk/client-s3';
import { ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';
const s3 = new S3({
    credentials: {
        accessKeyId: process.env.CMS_ACCESS_KEY_ID || '',
        //logger: console,
        secretAccessKey: process.env.CMS_SECRET_ACCESS_KEY_ID || '',
    },
    region: process.env.CMS_DEFAULT_REGION,
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
    console.log('uploading image', file, key);
    s3.putObject({
        Body: file,
        Key: key,
        Bucket: tsiBucket,
    }).catch((error) => {
        console.error(error);
    });
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
    const listParams = {
        Bucket: tsiBucket,
        Prefix: folderKey,
    };
    const listedObjects = await s3.send(new ListObjectsV2Command(listParams));
    if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
        console.log('Folder is empty or does not exist');
        return;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiczNGdW5jdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdXRpbGl0aWVzL3MzRnVuY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxRQUFRLENBQUE7QUFDL0IsTUFBTSxFQUFFLENBQUE7QUFDUixPQUFPLE9BQU8sTUFBTSxpQkFBaUIsQ0FBQTtBQUNyQyxNQUFNLFNBQVMsR0FBRyx1QkFBdUIsQ0FBQTtBQUN6QyxNQUFNLFNBQVMsR0FBRyxnREFBZ0QsQ0FBQTtBQUNsRSxPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sb0JBQW9CLENBQUE7QUFDdkMsT0FBTyxFQUFFLG9CQUFvQixFQUFFLG9CQUFvQixFQUFFLE1BQU0sb0JBQW9CLENBQUE7QUFHL0UsTUFBTSxFQUFFLEdBQUcsSUFBSSxFQUFFLENBQUM7SUFDZCxXQUFXLEVBQUU7UUFDVCxXQUFXLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsSUFBSSxFQUFFO1FBQ2hELGtCQUFrQjtRQUNsQixlQUFlLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsSUFBSSxFQUFFO0tBQzlEO0lBQ0QsTUFBTSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCO0NBQ3pDLENBQUMsQ0FBQTtBQUVGLGdGQUFnRjtBQUNoRixNQUFNLGNBQWMsR0FBRyxDQUFDLE1BQWdCLEVBQW1CLEVBQUU7SUFDekQsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUNuQyxNQUFNLE1BQU0sR0FBVSxFQUFFLENBQUE7UUFDeEIsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtRQUNoRCxNQUFNLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxH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