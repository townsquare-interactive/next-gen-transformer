"use strict";
/* let p = new Promise((resolve, reject) => {
    let a = 1 + 1
    if (a == 2) {
        resolve('success')
    } else {
        reject('failed')
    }
})

p.then((message) => {
    console.log('this is in the then ' + message)
}).catch((message) => {
    console.log('this is in the catch ' + message)
})

function watchTutorialPromise() {
    let userLeft = false
    let userWatchingCatMeme = false
    return new Promise((resolve, reject) => {
        if (userLeft) {
            reject({
                name: 'User Left',
                message: ':(',
            })
        } else if (userWatchingCatMeme) {
            reject({
                name: 'User Watching Cat Meme',
                message: 'WebDevSimplified < Cat',
            })
        } else {
            resolve('We have a sucess')
        }
    })
}

watchTutorialPromise()
    .then((message) => {
        console.log(message)
    })
    .catch((error) => {
        console.log(error.name + ' ' + error.message)
    }) */
/*----------------------------- Async Await ----------------------------------------*/
function makeRequest(location) {
    return new Promise((resolve, reject) => {
        console.log(`making request to ${location}`);
        if (location === 'Google') {
            resolve('www.google.com');
        }
        else {
            reject('We can only search Google');
        }
    });
}
function processRequest(response) {
    const newObj = {
        browserSite: response,
    };
    return new Promise((resolve, reject) => {
        console.log('Processing response');
        /* resolve(`Extra Information + ${response}`) */
        resolve(newObj);
    });
}
async function findLocation() {
    try {
        const response = await makeRequest('Google');
        console.log('response received');
        const processedResponse = await processRequest(response);
        console.log(processedResponse);
    }
    catch (err) {
        //Logs the reject from the else
        console.log(err);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvbWlzZVBsYXlncm91bmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9wcm9taXNlUGxheWdyb3VuZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1NBeUNTO0FBRVQsc0ZBQXNGO0FBQ3RGLFNBQVMsV0FBVyxDQUFDLFFBQVE7SUFDekIsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUNuQyxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixRQUFRLEVBQUUsQ0FBQyxDQUFBO1FBQzVDLElBQUksUUFBUSxLQUFLLFFBQVEsRUFBRTtZQUN2QixPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtTQUM1QjthQUFNO1lBQ0gsTUFBTSxDQUFDLDJCQUEyQixDQUFDLENBQUE7U0FDdEM7SUFDTCxDQUFDLENBQUMsQ0FBQTtBQUNOLENBQUM7QUFFRCxTQUFTLGNBQWMsQ0FBQyxRQUFRO0lBQzVCLE1BQU0sTUFBTSxHQUFHO1FBQ1gsV0FBVyxFQUFFLFFBQVE7S0FDeEIsQ0FBQTtJQUNELE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDbkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFBO1FBQ2xDLGdEQUFnRDtRQUNoRCxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDbkIsQ0FBQyxDQUFDLENBQUE7QUFDTixDQUFDO0FBRUQsS0FBSyxVQUFVLFlBQVk7SUFDdkIsSUFBSTtRQUNBLE1BQU0sUUFBUSxHQUFHLE1BQU0sV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQzVDLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtRQUNoQyxNQUFNLGlCQUFpQixHQUFHLE1BQU0sY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQ3hELE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQTtLQUNqQztJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1YsK0JBQStCO1FBQy9CLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7S0FDbkI7QUFDTCxDQUFDIn0=