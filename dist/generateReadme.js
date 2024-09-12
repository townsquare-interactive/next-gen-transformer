import * as fs from 'fs';
const errors = JSON.parse(fs.readFileSync('./src/utilities/errors.json', 'utf8'));
// Start errorType table
let markdown = '| Error Type | Description |\n';
markdown += '| ---------- | ------------------------------------------------------------------------------------------------------------------------- |\n';
// Add each error to the table
for (const [errorType, errorDetails] of Object.entries(errors)) {
    markdown += `| ${errorType} | ${errorDetails.description} |\n`;
}
// Read the existing README file
const readmePath = 'README.md';
let readmeContent = fs.readFileSync(readmePath, 'utf8');
// Define the markers for the error table section
const startMarker = '<!-- ERROR_TABLE_START -->';
const endMarker = '<!-- ERROR_TABLE_END -->';
// Construct the new content with markers
const newContent = `${startMarker}\n${markdown}\n${endMarker}`;
// Use regex to replace the existing table section, or insert if not present
const regex = new RegExp(`${startMarker}[\\s\\S]*${endMarker}`, 'g');
if (readmeContent.match(regex)) {
    readmeContent = readmeContent.replace(regex, newContent);
}
else {
    readmeContent = readmeContent.replace('<!-- ERROR_TABLE_PLACEHOLDER -->', newContent);
}
// Write the updated content back to the README.md file
fs.writeFileSync(readmePath, readmeContent);
console.log('README.md file has been updated with errors.json changes');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVSZWFkbWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9nZW5lcmF0ZVJlYWRtZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEtBQUssRUFBRSxNQUFNLElBQUksQ0FBQTtBQUN4QixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsNkJBQTZCLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQTtBQUVqRix3QkFBd0I7QUFDeEIsSUFBSSxRQUFRLEdBQUcsZ0NBQWdDLENBQUE7QUFDL0MsUUFBUSxJQUFJLDhJQUE4SSxDQUFBO0FBRTFKLDhCQUE4QjtBQUM5QixLQUFLLE1BQU0sQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO0lBQzdELFFBQVEsSUFBSSxLQUFLLFNBQVMsTUFBTSxZQUFZLENBQUMsV0FBVyxNQUFNLENBQUE7QUFDbEUsQ0FBQztBQUVELGdDQUFnQztBQUNoQyxNQUFNLFVBQVUsR0FBRyxXQUFXLENBQUE7QUFDOUIsSUFBSSxhQUFhLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUE7QUFFdkQsaURBQWlEO0FBQ2pELE1BQU0sV0FBVyxHQUFHLDRCQUE0QixDQUFBO0FBQ2hELE1BQU0sU0FBUyxHQUFHLDBCQUEwQixDQUFBO0FBRTVDLHlDQUF5QztBQUN6QyxNQUFNLFVBQVUsR0FBRyxHQUFHLFdBQVcsS0FBSyxRQUFRLEtBQUssU0FBUyxFQUFFLENBQUE7QUFFOUQsNEVBQTRFO0FBQzVFLE1BQU0sS0FBSyxHQUFHLElBQUksTUFBTSxDQUFDLEdBQUcsV0FBVyxZQUFZLFNBQVMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFBO0FBQ3BFLElBQUksYUFBYSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO0lBQzdCLGFBQWEsR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQTtBQUM1RCxDQUFDO0tBQU0sQ0FBQztJQUNKLGFBQWEsR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDLGtDQUFrQyxFQUFFLFVBQVUsQ0FBQyxDQUFBO0FBQ3pGLENBQUM7QUFFRCx1REFBdUQ7QUFDdkQsRUFBRSxDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQUUsYUFBYSxDQUFDLENBQUE7QUFFM0MsT0FBTyxDQUFDLEdBQUcsQ0FBQywwREFBMEQsQ0FBQyxDQUFBIn0=