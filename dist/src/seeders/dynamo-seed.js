"use strict";
const axios = require('axios');
const { addOrUpdateCharacter } = require('../controllers/dynamo-controller');
//Function to add all entries from this api into DynamoDB
const seedData = async () => {
    const url = 'http://hp-api.herokuapp.com/api/characters';
    try {
        //Renames data from res to characters
        const { data: characters } = await axios.get(url);
        //promise.all lets them all run at the same time
        const characterPromises = characters.map((character, i) => addOrUpdateCharacter({ ...character, id: i + '' }));
        await Promise.all(characterPromises);
    }
    catch (err) {
        console.error(err);
        console.log('something went wrong');
    }
};
seedData();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHluYW1vLXNlZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvc2VlZGVycy9keW5hbW8tc2VlZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQzlCLE1BQU0sRUFBRSxvQkFBb0IsRUFBRSxHQUFHLE9BQU8sQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFBO0FBRTVFLHlEQUF5RDtBQUN6RCxNQUFNLFFBQVEsR0FBRyxLQUFLLElBQUksRUFBRTtJQUN4QixNQUFNLEdBQUcsR0FBRyw0Q0FBNEMsQ0FBQTtJQUN4RCxJQUFJO1FBQ0EscUNBQXFDO1FBQ3JDLE1BQU0sRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEdBQUcsTUFBTSxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pELGdEQUFnRDtRQUNoRCxNQUFNLGlCQUFpQixHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLEdBQUcsU0FBUyxFQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFBO1FBQzlHLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBO0tBQ3ZDO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVixPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2xCLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQTtLQUN0QztBQUNMLENBQUMsQ0FBQTtBQUVELFFBQVEsRUFBRSxDQUFBIn0=