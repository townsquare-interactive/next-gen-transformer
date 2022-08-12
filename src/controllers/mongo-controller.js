require('dotenv').config()
const Item = require('../../schema')

const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/hp', { useNewUrlParser: true })
const db = mongoose.connection

db.on('error', (error) => console.error(error))
db.once('open', (error) => console.error('connected to database'))

/* const Any = new mongoose.Schema({ any: {} })

const Item = mongoose.model('Characters', Any) */

const TABLE_NAME = 'hp'

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
    const newChar = new Item({
        name: req.body.name,
        id: req.body.id,
    })

    const newCharacter = await newChar.save()
    return newCharacter
}

const updateCharacter = async (req) => {
    const updateObject = req.body
    return Item.findOneAndUpdate({ id: req.params.id }, updateObject, { upsert: true })
    /* Item.findOneAndUpdate({ id: req.params.id }, updateObject, { upsert: true }, function (err, doc) {
        if (err) return res.send(500, { error: err })
        return res.send('Succesfully saved.')
    }) */
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
}
