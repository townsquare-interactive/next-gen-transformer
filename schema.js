const mongoose = require('mongoose')

const Any = new mongoose.Schema({
    any: {},
    /*     _id: {
        type: String,
        required: false,
    }, */
    /*     _id: mongoose.Schema.Types.ObjectId, */
    id: {
        type: String,
        required: false,
    },
    name: {
        type: String,
        required: false,
    },
})

const Item = mongoose.model('Characters', Any)

module.exports = Item
