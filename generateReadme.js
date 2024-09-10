import * as fs from 'fs'
const errors = JSON.parse(fs.readFileSync('./src/utilities/errors.json', 'utf8'))

// Start errorType table
let markdown = '| Error Type | Description |\n'
markdown += '| ---------- | ------------------------------------------------------------------------------------------------------------------------- |\n'

// Add each error to the table
for (const [errorType, errorDetails] of Object.entries(errors)) {
    markdown += `| ${errorType} | ${errorDetails.description} |\n`
}

// Read the existing README file
const readmePath = 'README.md'
let readmeContent = fs.readFileSync(readmePath, 'utf8')

// Define the markers for the error table section
const startMarker = '<!-- ERROR_TABLE_START -->'
const endMarker = '<!-- ERROR_TABLE_END -->'

// Construct the new content with markers
const newContent = `${startMarker}\n${markdown}\n${endMarker}`

// Use regex to replace the existing table section, or insert if not present
const regex = new RegExp(`${startMarker}[\\s\\S]*${endMarker}`, 'g')
if (readmeContent.match(regex)) {
    readmeContent = readmeContent.replace(regex, newContent)
} else {
    readmeContent = readmeContent.replace('<!-- ERROR_TABLE_PLACEHOLDER -->', newContent)
}

// Write the updated content back to the README.md file
fs.writeFileSync(readmePath, readmeContent)

console.log('README.md file has been updated with errors.json changes')
