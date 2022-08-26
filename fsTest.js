var fs = require('fs')

const cmsWhole = require('./cmswhole.json')

const { transformFile, addFile, transformWhole } = require('./src/controllers/cms-controller')

//Logs the code from the other file
/* fs.readFile('index.js', 'utf8', function (err, data) {
    console.log(data)
})
 */

//Changes the file to the code passed as second parameter

/* const obj = JSON.stringify(transformWhole(cmsWhole))
/* console.log('obj', obj) */

/*fs.writeFile('new.json', obj, function (err) {
    console.log('data saved')
}) */

//appends file with code
/* fs.appendFile('test.js', 'console.log("done")', function (err) {
    console.log('data saved')
}) */

//deletes file
/* fs.unlink('test.js', function (err) {
    console.log('Deleted')
}) */

var href = 'joshedwards?343.production.com'
href = href.replace(/\..*/, '')
console.log(href) //# => /Controller/Action
