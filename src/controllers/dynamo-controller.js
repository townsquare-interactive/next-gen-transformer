const AWS = require('aws-sdk')
require('dotenv').config()

const credentials = {
    accessKeyId: process.env.DYN_ACCESS_KEY_ID,
    secretAccessKey: process.env.DYN_SECRET_ACCESS_KEY,
}

AWS.config.update({
    region: process.env.DYN_DEFAULT_REGION,
    /* accessKeyId: process.env.DYN_ACCESS_KEY_ID,
    secretAccessKey: process.env.DYN_SECRET_ACCESS_KEY, */
    credential: credentials,
})

const dynamoClient = new AWS.DynamoDB.DocumentClient()
const TABLE_NAME = 'dynamo-api'

const getCharacters = async () => {
    const params = {
        TableName: TABLE_NAME,
    }
    const characters = await dynamoClient.scan(params).promise()
    /* console.log(characters) */
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
