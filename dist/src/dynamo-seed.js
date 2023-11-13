"use strict";
const axios = require('axios');
const { addOrUpdateCharacter } = require('./controllers/dynamo-controller');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHluYW1vLXNlZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZHluYW1vLXNlZWQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQTtBQUM5QixNQUFNLEVBQUUsb0JBQW9CLEVBQUUsR0FBRyxPQUFPLENBQUMsaUNBQWlDLENBQUMsQ0FBQTtBQUUzRSx5REFBeUQ7QUFDekQsTUFBTSxRQUFRLEdBQUcsS0FBSyxJQUFJLEVBQUU7SUFDeEIsTUFBTSxHQUFHLEdBQUcsNENBQTRDLENBQUE7SUFDeEQsSUFBSTtRQUNBLHFDQUFxQztRQUNyQyxNQUFNLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxHQUFHLE1BQU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqRCxnREFBZ0Q7UUFDaEQsTUFBTSxpQkFBaUIsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsb0JBQW9CLENBQUMsRUFBRSxHQUFHLFNBQVMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQTtRQUM5RyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQTtLQUN2QztJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1YsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNsQixPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLENBQUE7S0FDdEM7QUFDTCxDQUFDLENBQUE7QUFFRCxRQUFRLEVBQUUsQ0FBQSJ9