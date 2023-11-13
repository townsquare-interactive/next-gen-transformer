"use strict";
var MongoClient = require('mongodb').MongoClient;
/* var url = 'mongodb://localhost:27017/hp' */
MongoClient.connect('mongodb://localhost/hp', function (err, db) {
    if (err)
        throw err;
    console.log('Database created!');
    db.close();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9uZ29TZWVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vbW9uZ29TZWVkLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxJQUFJLFdBQVcsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsV0FBVyxDQUFBO0FBQ2hELDhDQUE4QztBQUU5QyxXQUFXLENBQUMsT0FBTyxDQUFDLHdCQUF3QixFQUFFLFVBQVUsR0FBRyxFQUFFLEVBQUU7SUFDM0QsSUFBSSxHQUFHO1FBQUUsTUFBTSxHQUFHLENBQUE7SUFDbEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO0lBQ2hDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQTtBQUNkLENBQUMsQ0FBQyxDQUFBIn0=