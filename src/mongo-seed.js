const axios = require('axios')
const { addMultiCharacters } = require('./controllers/mongo-controller')

const seedData = async () => {
    const url = 'http://hp-api.herokuapp.com/api/characters'
    try {
        //Renames data from res to characters
        const { data: characters } = await axios.get(url)
        //promise.all lets them all run at the same time
        const characterPromises = characters.map((character, i) => addMultiCharacters({ ...character, id: i + '' }))
        await Promise.all(characterPromises)
    } catch (err) {
        console.error(err)
        console.log('something went wrong')
    }
}

seedData()
