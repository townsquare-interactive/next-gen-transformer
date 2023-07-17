import { config } from 'dotenv';
config();
import request from 'request-promise';
const tsiBucket = 'townsquareinteractive';
const bucketUrl = 'https://townsquareinteractive.s3.amazonaws.com';
import AWS from 'aws-sdk';
AWS.config.update({
    region: process.env.CMS_DEFAULT_REGION,
    accessKeyId: process.env.CMS_ACCESS_KEY_ID,
    secretAccessKey: process.env.CMS_SECRET_ACCESS_KEY_ID,
    //logger: console,
});
const s3 = new AWS.S3();
//Get S3 object and return, if not found return passed object
export const getFileS3 = async (key, rtnObj = { pages: [] }, type = 'json') => {
    if (type === 'json') {
        try {
            const data = await s3.getObject({ Bucket: tsiBucket, Key: key }).promise();
            return JSON.parse(data.Body.toString('utf-8'));
        }
        catch (err) {
            console.log('file  not found in S3, creating new file');
            return rtnObj;
        }
    }
    else {
        try {
            const data = await s3.getObject({ Bucket: tsiBucket, Key: key });
            return data.Body.toString('utf-8');
        }
        catch (err) {
            console.log('css file not in s3');
            return rtnObj;
        }
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
        .promise()
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
//add any file, pass it the file and key for filename
export const addFileS3List = async (file, key) => {
    //console.log('File to be added', file)
    await s3
        .putObject({
        Body: JSON.stringify(file),
        Bucket: tsiBucket,
        Key: key,
    })
        .promise();
    console.log('S3 File Added');
};
export const deleteFileS3 = async (key) => {
    console.log('File to be deleted', key);
    await s3
        .deleteObject({
        Bucket: tsiBucket,
        Key: key,
    })
        .promise();
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
/* export default {
    addMultipleS3,
    addFileS3,
    addAssetFromSiteToS3,
    getFileS3,
    getCssFile,
    addFileS3List,
    deleteFileS3,
} */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiczNGdW5jdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvczNGdW5jdGlvbnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFFBQVEsQ0FBQTtBQUMvQixNQUFNLEVBQUUsQ0FBQTtBQUNSLE9BQU8sT0FBTyxNQUFNLGlCQUFpQixDQUFBO0FBQ3JDLE1BQU0sU0FBUyxHQUFHLHVCQUF1QixDQUFBO0FBQ3pDLE1BQU0sU0FBUyxHQUFHLGdEQUFnRCxDQUFBO0FBRWxFLE9BQU8sR0FBRyxNQUFNLFNBQVMsQ0FBQTtBQUV6QixHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUNkLE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQjtJQUN0QyxXQUFXLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUI7SUFDMUMsZUFBZSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCO0lBQ3JELGtCQUFrQjtDQUNyQixDQUFDLENBQUE7QUFDRixNQUFNLEVBQUUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQTtBQUV2Qiw2REFBNkQ7QUFDN0QsTUFBTSxDQUFDLE1BQU0sU0FBUyxHQUFHLEtBQUssRUFBRSxHQUFHLEVBQUUsTUFBTSxHQUFHLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksR0FBRyxNQUFNLEVBQUUsRUFBRTtJQUMxRSxJQUFJLElBQUksS0FBSyxNQUFNLEVBQUU7UUFDakIsSUFBSTtZQUNBLE1BQU0sSUFBSSxHQUFHLE1BQU0sRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUE7WUFDMUUsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8s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