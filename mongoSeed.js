var MongoClient = require('mongodb').MongoClient
/* var url = 'mongodb://localhost:27017/hp' */

MongoClient.connect('mongodb://localhost/hp', function (err, db) {
    if (err) throw err
    console.log('Database created!')
    db.close()
})
