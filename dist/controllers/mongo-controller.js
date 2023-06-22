"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
require('dotenv').config();
const Item = require('../models/schema');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL, { usebasePathParser: true });
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', (error) => console.error('connected to database'));
const getCharacters = () => __awaiter(void 0, void 0, void 0, function* () {
    const characters = yield Item.find();
    return characters;
});
const getCharacterById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    char = yield Item.find({ id: id });
    if (char == null) {
        return res.status(404).json({ message: 'cannot find' });
    }
    else {
        return char;
    }
});
const addCharacter = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const newChar = new Item(req.body);
    const newCharacter = yield newChar.save();
    return newCharacter;
});
const addMultiCharacters = (character) => __awaiter(void 0, void 0, void 0, function* () {
    const newChar = new Item(character);
    const newCharacter = yield newChar.save();
    return newCharacter;
});
const updateCharacter = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const updateObject = req.body;
    return Item.findOneAndUpdate({ id: req.params.id }, updateObject, { upsert: true });
});
const deleteCharacter = (id) => __awaiter(void 0, void 0, void 0, function* () {
    char = yield Item.find({ id: id });
    if (char == null) {
        return res.status(404).json({ message: 'cannot find' });
    }
    return yield Item.findOneAndRemove({ id: id });
});
module.exports = {
    mongoose,
    getCharacters,
    getCharacterById,
    deleteCharacter,
    updateCharacter,
    addCharacter,
    addMultiCharacters,
};
//# sourceMappingURL=mongo-controller.js.map