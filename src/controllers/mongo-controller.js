require('dotenv').config()
const Item = require('../../schema')

/*const AWS = require('aws-sdk')


 AWS.config.update({
    region: process.env.DYN_DEFAULT_REGION,
    accessKeyId: process.env.DYN_ACCESS_KEY_ID,
    secretAccessKey: process.env.DYN_SECRET_ACCESS_KEY_ID,
})

const dynamoClient = new AWS.DynamoDB.DocumentClient()
const TABLE_NAME = 'dynamo-api' */

const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/hp', { useNewUrlParser: true })
const db = mongoose.connection

db.on('error', (error) => console.error(error))
db.once('open', (error) => console.error('connected to database'))

/* const Any = new mongoose.Schema({ any: {} })

const Item = mongoose.model('Characters', Any) */

const TABLE_NAME = 'hp'

const getCharacters = async () => {
    /*     const params = {
        TableName: TABLE_NAME,
    } */
    /* const characters = await Item.scan(params).promise() */
    const characters = await Item.find()
    return characters
}

const getCharacterById = async (id) => {
    char = await Item.find({ id: id })
    if (char == null) {
        return res.status(404).json({ message: 'cannot find' })
    } else {
        return char
    }
}

const addOrUpdateCharacter = async (character) => {
    const params = new Item({
        /* TableName: TABLE_NAME, */
        Item: character,
    })
    return await Item.save(params).promise()
}

const deleteCharacter = async (id) => {
    char = await Item.find({ id: id })
    if (char == null) {
        return res.status(404).json({ message: 'cannot find' })
    }
    return await Item.findOneAndRemove({ id: id })
}

module.exports = {
    mongoose,
    getCharacters,
    getCharacterById,
    deleteCharacter,
    addOrUpdateCharacter,
}
