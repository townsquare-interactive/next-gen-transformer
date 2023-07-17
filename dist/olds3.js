"use strict";
require('dotenv').config();
const request = require('request-promise');
const tsiBucket = 'townsquareinteractive';
const bucketUrl = 'https://townsquareinteractive.s3.amazonaws.com';
const AWS = require('aws-sdk');
AWS.config.update({
    region: process.env.CMS_DEFAULT_REGION,
    accessKeyId: process.env.CMS_ACCESS_KEY_ID,
    secretAccessKey: process.env.CMS_SECRET_ACCESS_KEY_ID,
    //logger: console,
});
const s3 = new AWS.S3();
//Get S3 object and return, if not found return passed object
const getFileS3 = async (key, rtnObj = { pages: [] }, type = 'json') => {
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
const addFileS3 = async (file, key, fileType = 'json') => {
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
const addAssetFromSiteToS3 = async (file, key) => {
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
const addMultipleS3 = async (data, pageList, basePath) => {
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
const addFileS3List = async (file, key) => {
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
const deleteFileS3 = async (key) => {
    console.log('File to be deleted', key);
    await s3
        .deleteObject({
        Bucket: tsiBucket,
        Key: key,
    })
        .promise();
    console.log('S3 File Deleted');
};
const getCssFile = async (pageSlug, basePath) => {
    var options = {
        uri: `${bucketUrl}/${basePath}/styles/${pageSlug}.scss`,
        encoding: null,
    };
    let cssFile;
    await request(options, function (error, response, body) {
        if (error || response.statusCode !== 200) {
            console.log('failed to get file');
            cssFile = '';
        }
        else {
            cssFile = body.toString('utf-8');
        }
    });
    return cssFile;
};
module.exports = {
    addMultipleS3,
    addFileS3,
    addAssetFromSiteToS3,
    getFileS3,
    getCssFile,
    addFileS3List,
    deleteFileS3,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2xkczMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9vbGRzMy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFBO0FBQzFCLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBO0FBQzFDLE1BQU0sU0FBUyxHQUFHLHVCQUF1QixDQUFBO0FBQ3pDLE1BQU0sU0FBUyxHQUFHLGdEQUFnRCxDQUFBO0FBRWxFLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQTtBQUU5QixHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUNkLE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQjtJQUN0QyxXQUFXLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUI7SUFDMUMsZUFBZSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCO0lBQ3JELGtCQUFrQjtDQUNyQixDQUFDLENBQUE7QUFDRixNQUFNLEVBQUUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQTtBQUV2Qiw2REFBNkQ7QUFDN0QsTUFBTSxTQUFTLEdBQUcsS0FBSyxFQUFFLEdBQUcsRUFBRSxNQUFNLEdBQUcsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxHQUFHLE1BQU0sRUFBRSxFQUFFO0lBQ25FLElBQUksSUFBSSxLQUFLLE1BQU0sRUFBRTtRQUNqQixJQUFJO1lBQ0EsTUFBTSxJQUFJLEdBQUcsTUFBTSxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtZQUMxRSxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FB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