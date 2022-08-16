const { updateCharacter, getCharacters, deleteCharacter, getCharacterById, addCharacter } = require('../controllers/mongo-controller')

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
        const id = req.params.id
        try {
            const character = await getCharacterById(id)
            res.json(character)
        } catch (err) {
            console.error(err)
            res.status(500).json({ err: 'Something went wrong' })
        }
    })

    app.post('/characters', async (req, res) => {
        try {
            res.json(addCharacter(req))
        } catch (err) {
            console.error(err)
            res.status(500).json({ err: 'Something went wrong' })
        }
    })

    app.patch('/characters/:id', async (req, res) => {
        try {
            await updateCharacter(req)
            res.json('successful change')
        } catch (err) {
            console.error(err)
            res.status(500).json({ err: 'Something went wrong' })
        }
    })

    app.delete('/characters/:id', async (req, res) => {
        const id = req.params.id
        try {
            res.json(await deleteCharacter(id))
        } catch (err) {
            console.error(err)
            res.status(500).json({ err: 'Something went wrong' })
        }
    })
}

module.exports = routes
