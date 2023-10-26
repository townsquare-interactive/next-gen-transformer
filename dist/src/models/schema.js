"use strict";
const mongoose = require('mongoose');
const Any = new mongoose.Schema({
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
});
const Item = mongoose.model('Characters', Any);
module.exports = Item;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NoZW1hLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL21vZGVscy9zY2hlbWEuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQTtBQUVwQyxNQUFNLEdBQUcsR0FBRyxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUM7SUFDNUIsRUFBRSxFQUFFO1FBQ0EsSUFBSSxFQUFFLE1BQU07UUFDWixRQUFRLEVBQUUsS0FBSztLQUNsQjtJQUNELElBQUksRUFBRTtRQUNGLElBQUksRUFBRSxNQUFNO1FBQ1osUUFBUSxFQUFFLEtBQUs7S0FDbEI7SUFDRCxPQUFPLEVBQUU7UUFDTCxJQUFJLEVBQUUsTUFBTTtRQUNaLFFBQVEsRUFBRSxLQUFLO0tBQ2xCO0lBQ0QsTUFBTSxFQUFFO1FBQ0osSUFBSSxFQUFFLE1BQU07UUFDWixRQUFRLEVBQUUsS0FBSztLQUNsQjtJQUNELE1BQU0sRUFBRTtRQUNKLElBQUksRUFBRSxPQUFPO1FBQ2IsUUFBUSxFQUFFLEtBQUs7S0FDbEI7SUFDRCxLQUFLLEVBQUU7UUFDSCxJQUFJLEVBQUUsTUFBTTtRQUNaLFFBQVEsRUFBRSxLQUFLO0tBQ2xCO0NBQ0osQ0FBQyxDQUFBO0FBRUYsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUUsR0FBRyxDQUFDLENBQUE7QUFFOUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUEifQ==