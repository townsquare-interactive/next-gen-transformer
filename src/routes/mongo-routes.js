/* const express = require('express') */
/* const router = express.app() */
/* const { addOrUpdateCharacter, getCharacters, deleteCharacter, getCharacterById } = require('../controllers/dynamo-controller') */
const { addOrUpdateCharacter, getCharacters, deleteCharacter, getCharacterById } = require('../controllers/mongo-controller')

const Item = require('../../schema')

const routes = (app) => {
    app.get('/characters', async (req, res) => {
        try {
            const characters = await getCharacters()
            res.json(characters)
        } catch (err) {
            console.error(err)
            res.status(500).json({ err: 'Something went wrong' })
        }
    })

    app.get('/characters/:id', async (req, res) => {
        /* const id = req.params.id */
        try {
            /* const character = await getCharacterById(id) */
            const character = await Item.findById(req.params.id)
            res.json(character)
        } catch (err) {
            console.error(err)
            res.status(500).json({ err: 'Something went wrong' })
        }
    })

    app.post('/characters', async (req, res) => {
        /* const character = req.body */
        const newChar = new Item({
            name: req.body.name,
            id: req.body.id,
        })
        try {
            const newCharacter = await newChar.save()
            /* const newCharacter = await addOrUpdateCharacter(character) */
            res.json(newCharacter)
        } catch (err) {
            console.error(err)
            res.status(500).json({ err: 'Something went wrong' })
        }
    })

    app.put('/characters/:id', async (req, res) => {
        const character = req.body
        const { id } = req.params
        character.id = id
        try {
            const newCharacter = await addOrUpdateCharacter(character)
            res.json(newCharacter)
        } catch (err) {
            console.error(err)
            res.status(500).json({ err: 'Something went wrong' })
        }
    })

    app.delete('/characters/:id', async (req, res) => {
        const { id } = req.params
        try {
            res.json(await deleteCharacter(id))
        } catch (err) {
            console.error(err)
            res.status(500).json({ err: 'Something went wrong' })
        }
    })
}

module.exports = routes
