"use strict";
const axios = require('axios');
const { addMultiCharacters } = require('./controllers/mongo-controller');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9uZ28tc2VlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb25nby1zZWVkLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDOUIsTUFBTSxFQUFFLGtCQUFrQixFQUFFLEdBQUcsT0FBTyxDQUFDLGdDQUFnQyxDQUFDLENBQUE7QUFFeEUsd0RBQXdEO0FBQ3hELE1BQU0sUUFBUSxHQUFHLEtBQUssSUFBSSxFQUFFO0lBQ3hCLE1BQU0sR0FBRyxHQUFHLDRDQUE0QyxDQUFBO0lBQ3hELElBQUk7UUFDQSxxQ0FBcUM7UUFDckMsTUFBTSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsR0FBRyxNQUFNLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakQsZ0RBQWdEO1FBQ2hELE1BQU0saUJBQWlCLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsR0FBRyxTQUFTLEVBQUUsRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFDNUcsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUE7S0FDdkM7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNWLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDbEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFBO0tBQ3RDO0FBQ0wsQ0FBQyxDQUFBO0FBRUQsUUFBUSxFQUFFLENBQUEifQ==