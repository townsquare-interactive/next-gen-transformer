"use strict";
const axios = require('axios');
const { addMultiCharacters } = require('../controllers/mongo-controller');
//Function to add all entries from this api into mongoDB
const seedData = async () => {
    const url = 'http://hp-api.herokuapp.com/api/characters';
    try {
        //Renames data from res to characters
        const { data: characters } = await axios.get(url);
        //promise.all lets them all run at the same time
        const characterPromises = characters.map((character, i) => addMultiCharacters({ ...character, id: i + '' }));
        await Promise.all(characterPromises);
    }
    catch (err) {
        console.error(err);
        console.log('something went wrong');
    }
};
seedData();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9uZ28tc2VlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZWVkZXJzL21vbmdvLXNlZWQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQTtBQUM5QixNQUFNLEVBQUUsa0JBQWtCLEVBQUUsR0FBRyxPQUFPLENBQUMsaUNBQWlDLENBQUMsQ0FBQTtBQUV6RSx3REFBd0Q7QUFDeEQsTUFBTSxRQUFRLEdBQUcsS0FBSyxJQUFJLEVBQUU7SUFDeEIsTUFBTSxHQUFHLEdBQUcsNENBQTRDLENBQUE7SUFDeEQsSUFBSTtRQUNBLHFDQUFxQztRQUNyQyxNQUFNLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxHQUFHLE1BQU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqRCxnREFBZ0Q7UUFDaEQsTUFBTSxpQkFBaUIsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsa0JBQWtCLENBQUMsRUFBRSxHQUFHLFNBQVMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQTtRQUM1RyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQTtLQUN2QztJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1YsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNsQixPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLENBQUE7S0FDdEM7QUFDTCxDQUFDLENBQUE7QUFFRCxRQUFRLEVBQUUsQ0FBQSJ9