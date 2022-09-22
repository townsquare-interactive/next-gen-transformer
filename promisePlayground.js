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

const { _ErrorFilterSensitiveLog } = require('@aws-sdk/client-s3')
const { error } = require('console')

/*----------------------------- Async Await ----------------------------------------*/
function makeRequest(location) {
    return new Promise((resolve, reject) => {
        console.log(`making request to ${location}`)
        if (location === 'Google') {
            resolve('www.google.com')
        } else {
            reject('We can only search Google')
        }
    })
}

function processRequest(response) {
    const newObj = {
        browserSite: response,
    }
    return new Promise((resolve, reject) => {
        console.log('Processing response')
        /* resolve(`Extra Information + ${response}`) */
        resolve(newObj)
    })
}

async function findLocation() {
    try {
        const response = await makeRequest('Google')
        console.log('response received')
        const processedResponse = await processRequest(response)
        console.log(processedResponse)
    } catch (err) {
        //Logs the reject from the else
        console.log(err)
    }
}

findLocation()
