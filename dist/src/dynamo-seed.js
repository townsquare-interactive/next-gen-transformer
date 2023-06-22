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
const axios = require('axios');
const { addOrUpdateCharacter } = require('./controllers/dynamo-controller');
//Function to add all entries from this api into DynamoDB
const seedData = () => __awaiter(void 0, void 0, void 0, function* () {
    const url = 'http://hp-api.herokuapp.com/api/characters';
    try {
        //Renames data from res to characters
        const { data: characters } = yield axios.get(url);
        //promise.all lets them all run at the same time
        const characterPromises = characters.map((character, i) => addOrUpdateCharacter(Object.assign(Object.assign({}, character), { id: i + '' })));
        yield Promise.all(characterPromises);
    }
    catch (err) {
        console.error(err);
        console.log('something went wrong');
    }
});
seedData();
//# sourceMappingURL=dynamo-seed.js.map