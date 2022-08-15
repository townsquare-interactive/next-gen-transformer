const mongoose = require('mongoose')

const Any = new mongoose.Schema({
    any: {},
    id: {
        type: String,
        required: false,
    },
    name: {
        type: String,
        required: false,
    },
    species: {
        type: String,
        required: false,
    },
    gender: {
        type: String,
        required: false,
    },
    wizard: {
        type: Boolean,
        required: false,
    },
    actor: {
        type: String,
        required: false,
    },
})

const Item = mongoose.model('Characters', Any)

module.exports = Item
