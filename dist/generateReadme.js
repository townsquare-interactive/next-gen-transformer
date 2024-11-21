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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVSZWFkbWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9nZW5lcmF0ZVJlYWRtZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEtBQUssRUFBRSxNQUFNLElBQUksQ0FBQTtBQUN4QixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsNkJBQTZCLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQTtBQUVqRix3QkFBd0I7QUFDeEIsSUFBSSxRQUFRLEdBQUcsZ0NBQWdDLENBQUE7QUFDL0MsUUFBUSxJQUFJLDhJQUE4SSxDQUFBO0FBRTFKLDhCQUE4QjtBQUM5QixLQUFLLE1BQU0sQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtJQUM1RCxRQUFRLElBQUksS0FBSyxTQUFTLE1BQU0sWUFBWSxDQUFDLFdBQVcsTUFBTSxDQUFBO0NBQ2pFO0FBRUQsZ0NBQWdDO0FBQ2hDLE1BQU0sVUFBVSxHQUFHLFdBQVcsQ0FBQTtBQUM5QixJQUFJLGFBQWEsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQTtBQUV2RCxpREFBaUQ7QUFDakQsTUFBTSxXQUFXLEdBQUcsNEJBQTRCLENBQUE7QUFDaEQsTUFBTSxTQUFTLEdBQUcsMEJBQTBCLENBQUE7QUFFNUMseUNBQXlDO0FBQ3pDLE1BQU0sVUFBVSxHQUFHLEdBQUcsV0FBVyxLQUFLLFFBQVEsS0FBSyxTQUFTLEVBQUUsQ0FBQTtBQUU5RCw0RUFBNEU7QUFDNUUsTUFBTSxLQUFLLEdBQUcsSUFBSSxNQUFNLENBQUMsR0FBRyxXQUFXLFlBQVksU0FBUyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUE7QUFDcEUsSUFBSSxhQUFhLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFO0lBQzVCLGFBQWEsR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQTtDQUMzRDtLQUFNO0lBQ0gsYUFBYSxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQUMsa0NBQWtDLEVBQUUsVUFBVSxDQUFDLENBQUE7Q0FDeEY7QUFFRCx1REFBdUQ7QUFDdkQsRUFBRSxDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQUUsYUFBYSxDQUFDLENBQUE7QUFFM0MsT0FBTyxDQUFDLEdBQUcsQ0FBQywwREFBMEQsQ0FBQyxDQUFBIn0=