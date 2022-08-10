const AWS = require('aws-sdk')
require('dotenv').config()

AWS.config.update({
    region: process.env.DYN_DEFAULT_REGION,
    accessKeyId: process.env.DYN_ACCESS_KEY_ID,
    secretAccessKey: process.env.DYN_SECRET_ACCESS_KEY,
    /*     region: 'us-east-1',
    accessKeyId: 'AKIA2W2JW4HH3ZOMQBBT',
    secretAccessKey: '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',*/
})

const dynamoClient = new AWS.DynamoDB.DocumentClient()
const TABLE_NAME = 'dynamo-api'

const getCharacters = async () => {
    const params = {
        TableName: TABLE_NAME,
    }
    const characters = await dynamoClient.scan(params).promise()
    /* console.log(characters) */

    //change
    return characters
}

const getCharacterById = async (id) => {
    const params = {
        TableName: TABLE_NAME,
        Key: {
            id,
        },
    }
    return await dynamoClient.get(params).promise()
}

const addOrUpdateCharacter = async (character) => {
    const params = {
        TableName: TABLE_NAME,
        Item: character,
    }
    return await dynamoClient.put(params).promise()
}

const deleteCharacter = async (id) => {
    const params = {
        TableName: TABLE_NAME,
        Key: {
            id,
        },
    }
    return await dynamoClient.delete(params).promise()
}

module.exports = {
    dynamoClient,
    getCharacters,
    getCharacterById,
    deleteCharacter,
    addOrUpdateCharacter,
}