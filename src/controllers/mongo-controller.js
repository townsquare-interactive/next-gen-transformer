require('dotenv').config()
const Item = require('../models/schema')

const mongoose = require('mongoose')
mongoose.connect(process.env.MONGO_URL, { usebasePathParser: true })
const db = mongoose.connection

db.on('error', (error) => console.error(error))
db.once('open', (error) => console.error('connected to database'))

const getCharacters = async () => {
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

const addCharacter = async (req) => {
    const newChar = new Item(req.body)
    const newCharacter = await newChar.save()
    return newCharacter
}

const addMultiCharacters = async (character) => {
    const newChar = new Item(character)
    const newCharacter = await newChar.save()
    return newCharacter
}

const updateCharacter = async (req) => {
    const updateObject = req.body
    return Item.findOneAndUpdate({ id: req.params.id }, updateObject, { upsert: true })
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
    updateCharacter,
    addCharacter,
    addMultiCharacters,
}
