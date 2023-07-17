"use strict";
var fs = require('fs');
const cmsWhole = require('./cmswhole.json');
const { transformFile, addFile, transformWhole } = require('./src/controllers/cms-controller');
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
var href = 'joshedwards?343.production.com';
href = href.replace(/\..*/, '');
console.log(href); //# => /Controller/Action
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnNUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vZnNUZXN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxJQUFJLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7QUFFdEIsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUE7QUFFM0MsTUFBTSxFQUFFLGFBQWEsRUFBRSxPQUFPLEVBQUUsY0FBYyxFQUFFLEdBQUcsT0FBTyxDQUFDLGtDQUFrQyxDQUFDLENBQUE7QUFFOUYsbUNBQW1DO0FBQ25DOzs7R0FHRztBQUVILHlEQUF5RDtBQUV6RDs2QkFDNkI7QUFFN0I7O0tBRUs7QUFFTCx3QkFBd0I7QUFDeEI7O0tBRUs7QUFFTCxjQUFjO0FBQ2Q7O0tBRUs7QUFFTCxJQUFJLElBQUksR0FBRyxnQ0FBZ0MsQ0FBQTtBQUMzQyxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUE7QUFDL0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQSxDQUFDLHlCQUF5QiJ9