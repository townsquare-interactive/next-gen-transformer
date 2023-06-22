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
const AWS = require('aws-sdk');
require('dotenv').config();
AWS.config.update({
    region: process.env.DYN_DEFAULT_REGION,
    accessKeyId: process.env.DYN_ACCESS_KEY_ID,
    secretAccessKey: process.env.DYN_SECRET_ACCESS_KEY_ID,
});
const dynamoClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'dynamo-api';
const getCharacters = () => __awaiter(void 0, void 0, void 0, function* () {
    const params = {
        TableName: TABLE_NAME,
    };
    const characters = yield dynamoClient.scan(params).promise();
    return characters;
});
const getCharacterById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const params = {
        TableName: TABLE_NAME,
        Key: {
            id,
        },
    };
    return yield dynamoClient.get(params).promise();
});
const addOrUpdateCharacter = (character) => __awaiter(void 0, void 0, void 0, function* () {
    const params = {
        TableName: TABLE_NAME,
        Item: character,
    };
    return yield dynamoClient.put(params).promise();
});
const deleteCharacter = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const params = {
        TableName: TABLE_NAME,
        Key: {
            id,
        },
    };
    return yield dynamoClient.delete(params).promise();
});
module.exports = {
    dynamoClient,
    getCharacters,
    getCharacterById,
    deleteCharacter,
    addOrUpdateCharacter,
};
//# sourceMappingURL=dynamo-controller.js.map