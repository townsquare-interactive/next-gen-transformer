var MongoClient = require('mongodb').MongoClient;
/* var url = 'mongodb://localhost:27017/hp' */
MongoClient.connect('mongodb://localhost/hp', function (err, db) {
    if (err)
        throw err;
    console.log('Database created!');
    db.close();
});
export {};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9uZ29TZWVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3NlZWRlcnMvbW9uZ29TZWVkLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUksV0FBVyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxXQUFXLENBQUE7QUFDaEQsOENBQThDO0FBRTlDLFdBQVcsQ0FBQyxPQUFPLENBQUMsd0JBQXdCLEVBQUUsVUFBVSxHQUFHLEVBQUUsRUFBRTtJQUMzRCxJQUFJLEdBQUc7UUFBRSxNQUFNLEdBQUcsQ0FBQTtJQUNsQixPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDLENBQUE7SUFDaEMsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFBO0FBQ2QsQ0FBQyxDQUFDLENBQUEifQ==