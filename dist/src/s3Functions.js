import { config } from 'dotenv';
config();
import request from 'request-promise';
const tsiBucket = 'townsquareinteractive';
const bucketUrl = 'https://townsquareinteractive.s3.amazonaws.com';
import AWS from 'aws-sdk';
import { S3 } from '@aws-sdk/client-s3';
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
});
const s3 = new S3({
    credentials: {
        accessKeyId: process.env.CMS_ACCESS_KEY_ID || '',
        //logger: console,
        secretAccessKey: process.env.CMS_SECRET_ACCESS_KEY_ID || '',
    },
    region: process.env.CMS_DEFAULT_REGION,
});
// Utility function to convert a Readable Stream to a string
const streamToString = (stream) => {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
        stream.on('error', (error) => reject(error));
    });
};
//Get S3 object and return, if not found return passed object
/* export const getFileS3 = async (key: string, rtnObj: any = { pages: [] }, type = 'json') => {
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
} */
export const getFileS3 = async (key, rtnObj = { pages: [] }, type = 'json') => {
    try {
        const data = await s3.getObject({ Bucket: tsiBucket, Key: key });
        if (data.Body) {
            // Convert the Readable Stream to a string
            const rawBody = await streamToString(data.Body);
            // If the content is JSON, return it directly
            try {
                const jsonData = JSON.parse(rawBody);
                //console.log('body has been found');
                console.log('here body', jsonData);
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
        console.error(`Error fetching file ${key} from S3:`, err);
        console.log(`File ${key} not found in S3, creating a new file`);
        return rtnObj;
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
//add any file, pass it the file and key for filename
export const addFileS3List = async (file, key) => {
    //console.log('File to be added', file)
    await s3.putObject({
        Body: JSON.stringify(file),
        Bucket: tsiBucket,
        Key: key,
    });
    console.log('S3 File Added');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiczNGdW5jdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvczNGdW5jdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFFBQVEsQ0FBQTtBQUMvQixNQUFNLEVBQUUsQ0FBQTtBQUNSLE9BQU8sT0FBTyxNQUFNLGlCQUFpQixDQUFBO0FBQ3JDLE1BQU0sU0FBUyxHQUFHLHVCQUF1QixDQUFBO0FBQ3pDLE1BQU0sU0FBUyxHQUFHLGdEQUFnRCxDQUFBO0FBQ2xFLE9BQU8sR0FBRyxNQUFNLFNBQVMsQ0FBQTtBQUN6QixPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sb0JBQW9CLENBQUE7QUFHdkMsbURBQW1EO0FBQ25ELDRFQUE0RTtBQUM1RSxrRkFBa0Y7QUFDbEYsbURBQW1EO0FBQ25ELDRFQUE0RTtBQUM1RSxrRkFBa0Y7QUFDbEYsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDZCxNQUFNLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0I7SUFDdEMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCO0lBQzFDLGVBQWUsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLHdCQUF3QjtJQUNyRCxrQkFBa0I7Q0FDckIsQ0FBQyxDQUFBO0FBQ0YsTUFBTSxFQUFFLEdBQUcsSUFBSSxFQUFFLENBQUM7SUFDZCxXQUFXLEVBQUU7UUFDVCxXQUFXLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsSUFBSSxFQUFFO1FBQ2hELGtCQUFrQjtRQUNsQixlQUFlLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsSUFBSSxFQUFFO0tBQzlEO0lBQ0QsTUFBTSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCO0NBQ3pDLENBQUMsQ0FBQTtBQUVGLDREQUE0RDtBQUM1RCxNQUFNLGNBQWMsR0FBRyxDQUFDLE1BQWdCLEVBQW1C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