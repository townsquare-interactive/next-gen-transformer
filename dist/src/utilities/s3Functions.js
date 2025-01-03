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
    const listParams = {
        Bucket: tsiBucket,
        Prefix: folderKey,
    };
    const listedObjects = await s3.send(new ListObjectsV2Command(listParams));
    if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
        console.log('Folder is empty or does not exist');
        return 'Folder is empty or does not exist, ' + folderKey;
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
    return 'S3 Folder Deleted ' + folderKey;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiczNGdW5jdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdXRpbGl0aWVzL3MzRnVuY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxRQUFRLENBQUE7QUFDL0IsTUFBTSxFQUFFLENBQUE7QUFDUixPQUFPLE9BQU8sTUFBTSxpQkFBaUIsQ0FBQTtBQUNyQyxNQUFNLFNBQVMsR0FBRyx1QkFBdUIsQ0FBQTtBQUN6QyxNQUFNLFNBQVMsR0FBRyxnREFBZ0QsQ0FBQTtBQUNsRSxPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sb0JBQW9CLENBQUE7QUFDdkMsT0FBTyxFQUFFLG9CQUFvQixFQUFFLG9CQUFvQixFQUFFLE1BQU0sb0JBQW9CLENBQUE7QUFHL0UsTUFBTSxFQUFFLEdBQUcsSUFBSSxFQUFFLENBQUM7SUFDZCxXQUFXLEVBQUU7UUFDVCxXQUFXLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsSUFBSSxFQUFFO1FBQ2hELGtCQUFrQjtRQUNsQixlQUFlLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsSUFBSSxFQUFFO0tBQzlEO0lBQ0QsTUFBTSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCO0NBQ3pDLENBQUMsQ0FBQTtBQUVGLGdGQUFnRjtBQUNoRixNQUFNLGNBQWMsR0FBRyxDQUFDLE1BQWdCLEVBQW1CLEVBQUU7SUFDekQsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUNuQyxNQUFNLE1BQU0sR0FBVSxFQUFFLENBQUE7UUFDeEIsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtRQUNoRCxNQUFNLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3hFLE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtJQUNoRCxDQUFDLENBQUMsQ0FBQTtBQUNOLENBQUMsQ0FBQTtBQUVELDZEQUE2RDtBQUM3RCxNQUFNLENBQUMsTUFBTSxTQUFTLEdBQUcsS0FBSyxFQUFFLEdBQVcsRUFBRSxTQUFjLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksR0FBRyxNQUFNLEVBQUUsRUFBRTtJQUN2RixJQUFJLENBQUM7UUFDRCxNQUFNLElBQUksR0FBRyxNQUFNLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFBO1FBRWhFLElBQUksSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ1osMENBQTBDO1lBQzFDLE1BQU0sT0FBTyxHQUFHLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFnQixDQUFDLENBQUE7WUFFM0QsNkNBQTZDO1lBQzdDLElBQUksQ0FBQztnQkFDRCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFBO2dCQUNwQyxPQUFPLFFBQVEsQ0FBQTtZQUNuQixDQUFDO1lBQUMsT0FBTyxTQUFTLEVBQUUsQ0FBQztnQkFDakIsa0RBQWtEO2dCQUNsRCxPQUFPLENBQUMsR0FBRyxDQUFDLGdEQUFnRCxDQUFDLENBQUE7Z0JBQzdELE9BQU8sT0FBTyxDQUFBO1lBQ2xCLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztJQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDWCxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsR0FBRyxrQkFBa0IsQ0FBQyxDQUFBO1FBQzFDLE9BQU8sTUFBTSxDQUFBO0lBQ2pCLENBQUM7QUFDTCxDQUFDLENBQUE7QUFFRDs7Ozs7Ozs7Ozs7O0lBWUk7QUFFSixNQUFNLENBQUMsTUFBTSxnQkFBZ0IsR0FBRyxLQUFLLEVBQUUsU0FBaUIsRUFBb0IsRUFBRTtJQUMxRSxJQUFJLENBQUM7UUFDRCxNQUFNLG1CQUFtQixHQUFHLE1BQU0sRUFBRSxDQUFDLGFBQWEsQ0FBQztZQUMvQyxNQUFNLEVBQUUsU0FBUztZQUNqQixNQUFNLEVBQUUsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLEdBQUcsR0FBRztZQUM3RCxPQUFPLEVBQUUsQ0FBQyxFQUFFLHFEQUFxRDtTQUNwRSxDQUFDLENBQUE7UUFFRixPQUFPLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQTtJQUN6RixDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNiLE9BQU8sQ0FBQyxLQUFLLENBQUMsNEJBQTRCLFNBQVMsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFDM0UsTUFBTSxLQUFLLENBQUEsQ0FBQyxzQkFBc0I7SUFDdEMsQ0FBQztBQUNMLENBQUMsQ0FBQTtBQUVELHVCQUF1QjtBQUN2QixNQUFNLENBQUMsTUFBTSxTQUFTLEdBQUcsS0FBSyxFQUFFLElBQVMsRUFBRSxHQUFXLEVBQUUsUUFBUSxHQUFHLE1BQU0sRUFBRSxFQUFFO0lBQ3pFLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUE7SUFDaEYsTUFBTSxJQUFJLEdBQUcsUUFBUSxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFBO0lBRTlELE1BQU0sRUFBRTtTQUNILFNBQVMsQ0FBQztRQUNQLElBQUksRUFBRSxJQUFJO1FBQ1YsTUFBTSxFQUFFLFNBQVM7UUFDakIsR0FBRyxFQUFFLEdBQUcsR0FBRyxJQUFJLFFBQVEsRUFBRTtRQUN6QixXQUFXLEVBQUUsYUFBYTtLQUM3QixDQUFDO1NBQ0QsS0FBSyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7UUFDYixPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ3hCLENBQUMsQ0FBQyxDQUFBO0lBRU4sT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQTtBQUM5QixDQUFDLENBQUE7QUFFRCxNQUFNLENBQUMsTUFBTSxZQUFZLEdBQUcsS0FBSyxFQUFFLElBQVMsRUFBRSxHQUFXLEVBQUUsRUFBRTtJQUN6RCxFQUFFLENBQUMsU0FBUyxDQUFDO1FBQ1QsSUFBSSxFQUFFLElBQUk7UUFDVixHQUFHLEVBQUUsR0FBRztRQUNSLE1BQU0sRUFBRSxTQUFTO0tBQ3BCLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtRQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDeEIsQ0FBQyxDQUFDLENBQUE7SUFFRixNQUFNLFVBQVUsR0FBRyxXQUFXLFNBQVMsK0JBQStCLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUE7SUFDL0YsT0FBTyxVQUFVLENBQUE7QUFDckIsQ0FBQyxDQUFBO0FBRUQsdUJBQXVCO0FBQ3ZCLE1BQU0sQ0FBQyxNQUFNLFdBQVcsR0FBRyxLQUFLLEVBQUUsSUFBUyxFQUFFLEdBQVcsRUFBRSxFQUFFO0lBQ3hELE1BQU0sRUFBRTtTQUNILFNBQVMsQ0FBQztRQUNQLE1BQU0sRUFBRSxTQUFTO1FBQ2pCLEdBQUcsRUFBRSxJQUFJLEdBQUcsR0FBRztLQUNsQixDQUFDO1NBQ0QsS0FBSyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7UUFDYixPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ3hCLENBQUMsQ0FBQyxDQUFBO0lBRU4sT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO0FBQ3BDLENBQUMsQ0FBQTtBQUVELDJEQUEyRDtBQUMzRCxNQUFNLENBQUMsTUFBTSxvQkFBb0IsR0FBRyxLQUFLLEVBQUUsSUFBUyxFQUFFLEdBQVcsRUFBRSxFQUFFO0lBQ2pFLElBQUksT0FBTyxHQUFHO1FBQ1YsR0FBRyxFQUFFLFNBQVMsR0FBRyxJQUFJO1FBQ3JCLFFBQVEsRUFBRSxJQUFJO0tBQ2pCLENBQUE7SUFDRCxPQUFPLENBQUMsT0FBTyxFQUFFLFVBQVUsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJO1FBQzVDLElBQUksS0FBSyxJQUFJLFFBQVEsQ0FBQyxVQUFVLEtBQUssR0FBRyxFQUFFLENBQUM7WUFDdkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFBO1lBQ2xDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDdEIsQ0FBQzthQUFNLENBQUM7WUFDSixFQUFFLENBQUMsU0FBUyxDQUNSO2dCQUNJLElBQUksRUFBRSxJQUFJO2dCQUNWLEdBQUcsRUFBRSxHQUFHO2dCQUNSLE1BQU0sRUFBRSxTQUFTO2FBQ3BCLEVBQ0QsVUFBVSxLQUFVLEVBQUUsSUFBUztnQkFDM0IsSUFBSSxLQUFLLEVBQUUsQ0FBQztvQkFDUixPQUFPLENBQUMsR0FBRyxDQUFDLCtCQUErQixDQUFDLENBQUE7Z0JBQ2hELENBQUM7cUJBQU0sQ0FBQztvQkFDSixPQUFPLENBQUMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLENBQUE7Z0JBQzFDLENBQUM7WUFDTCxDQUFDLENBQ0osQ0FBQTtRQUNMLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQTtBQUNOLENBQUMsQ0FBQTtBQUVELDhDQUE4QztBQUM5QyxNQUFNLENBQUMsTUFBTSxhQUFhLEdBQUcsS0FBSyxFQUFFLElBQVMsRUFBRSxRQUF1QixFQUFFLFFBQWdCLEVBQUUsRUFBRTtJQUN4RixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFBO0lBRXhCLDZCQUE2QjtJQUM3QixTQUFTLENBQUMsUUFBUSxFQUFFLEdBQUcsUUFBUSxrQkFBa0IsQ0FBQyxDQUFBO0lBRWxELHlCQUF5QjtJQUN6QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUN6QyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLFFBQVEsVUFBVSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQTtJQUNsRSxDQUFDO0lBRUQsMEJBQTBCO0lBQzFCLFNBQVMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxRQUFRLFdBQVcsQ0FBQyxDQUFBO0FBQzNDLENBQUMsQ0FBQTtBQUVELE1BQU0sQ0FBQyxNQUFNLGNBQWMsR0FBRyxLQUFLLEVBQUUsU0FBaUIsRUFBRSxFQUFFO0lBQ3RELE1BQU0sVUFBVSxHQUFHO1FBQ2YsTUFBTSxFQUFFLFNBQVM7UUFDakIsTUFBTSxFQUFFLFNBQVM7S0FDcEIsQ0FBQTtJQUVELE1BQU0sYUFBYSxHQUFHLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLG9CQUFvQixDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUE7SUFFekUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLElBQUksYUFBYSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDakUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFBO1FBQ2hELE9BQU8scUNBQXFDLEdBQUcsU0FBUyxDQUFBO0lBQzVELENBQUM7SUFFRCxxQ0FBcUM7SUFDckMsTUFBTSxZQUFZLEdBQUc7UUFDakIsTUFBTSxFQUFFLFNBQVM7UUFDakIsTUFBTSxFQUFFO1lBQ0osT0FBTyxFQUFFLGFBQWEsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDM0QsS0FBSyxFQUFFLElBQUk7U0FDZDtLQUNKLENBQUE7SUFFRCxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxvQkFBb0IsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFBO0lBRXJELE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsU0FBUyxDQUFDLENBQUE7SUFFM0MsT0FBTyxvQkFBb0IsR0FBRyxTQUFTLENBQUE7QUFDM0MsQ0FBQyxDQUFBO0FBRUQsTUFBTSxDQUFDLE1BQU0sWUFBWSxHQUFHLEtBQUssRUFBRSxHQUFXLEVBQUUsRUFBRTtJQUM5QyxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQixFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBRXRDLE1BQU0sRUFBRSxDQUFDLFlBQVksQ0FBQztRQUNsQixNQUFNLEVBQUUsU0FBUztRQUNqQixHQUFHLEVBQUUsR0FBRztLQUNYLENBQUMsQ0FBQTtJQUVGLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQTtBQUNsQyxDQUFDLENBQUE7QUFFRCxNQUFNLENBQUMsTUFBTSxVQUFVLEdBQUcsS0FBSyxFQUFFLFFBQWdCLEVBQUUsUUFBZ0IsRUFBRSxFQUFFO0lBQ25FLElBQUksT0FBTyxHQUFHO1FBQ1YsR0FBRyxFQUFFLEdBQUcsU0FBUyxJQUFJLFFBQVEsV0FBVyxRQUFRLE9BQU87UUFDdkQsUUFBUSxFQUFFLElBQUk7S0FDakIsQ0FBQTtJQUVELElBQUksT0FBTyxDQUFBO0lBQ1gsSUFBSSxDQUFDO1FBQ0QsTUFBTSxPQUFPLENBQUMsT0FBTyxFQUFFLFVBQVUsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJO1lBQ2xELE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFBO1lBQ2hDOzs7OztZQUtBO1FBQ0osQ0FBQyxDQUFDLENBQUE7SUFDTixDQUFDO0lBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNYLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsQ0FBQTtRQUNyQyxPQUFPLEVBQUUsQ0FBQTtJQUNiLENBQUM7SUFDRCxPQUFPLE9BQU8sQ0FBQTtBQUNsQixDQUFDLENBQUEifQ==