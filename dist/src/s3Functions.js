import { config } from 'dotenv';
config();
import request from 'request-promise';
const tsiBucket = 'townsquareinteractive';
const bucketUrl = 'https://townsquareinteractive.s3.amazonaws.com';
import { S3 } from '@aws-sdk/client-s3';
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
        console.log(`File ${key} not found in S3, creating a new file`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiczNGdW5jdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvczNGdW5jdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFFBQVEsQ0FBQTtBQUMvQixNQUFNLEVBQUUsQ0FBQTtBQUNSLE9BQU8sT0FBTyxNQUFNLGlCQUFpQixDQUFBO0FBQ3JDLE1BQU0sU0FBUyxHQUFHLHVCQUF1QixDQUFBO0FBQ3pDLE1BQU0sU0FBUyxHQUFHLGdEQUFnRCxDQUFBO0FBQ2xFLE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQTtBQUd2QyxNQUFNLEVBQUUsR0FBRyxJQUFJLEVBQUUsQ0FBQztJQUNkLFdBQVcsRUFBRTtRQUNULFdBQVcsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixJQUFJLEVBQUU7UUFDaEQsa0JBQWtCO1FBQ2xCLGVBQWUsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLHdCQUF3QixJQUFJLEVBQUU7S0FDOUQ7SUFDRCxNQUFNLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0I7Q0FDekMsQ0FBQyxDQUFBO0FBRUYsZ0ZBQWdGO0FBQ2hGLE1BQU0sY0FBYyxHQUFHLENBQUMsTUFBZ0IsRUFBbUIsRUFBRTtJQUN6RCxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQ25DLE1BQU0sTUFBTSxHQUFVLEVBQUUsQ0FBQTtRQUN4QixNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO1FBQ2hELE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxP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