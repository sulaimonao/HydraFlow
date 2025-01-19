// Script to find files with duplicate export of 'setSessionContext'

const fs = require('fs');
const path = require('path');

// Directory to start searching
const directoryPath = process.argv[2] || '.'; // Default to current directory if no path provided

// Directories to ignore
const ignoreDirs = ['node_modules', '.git', 'dist', 'build'];

// Function to recursively search files
function searchFiles(dir) {
  let files;
  try {
    files = fs.readdirSync(dir);
  } catch (err) {
    console.error(`Error reading directory ${dir}:`, err.message);
    return;
  }

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    try {
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        if (!ignoreDirs.includes(file)) {
          searchFiles(fullPath); // Recursive search in subdirectories
        }
      } else if (file.endsWith('.js') || file.endsWith('.mjs')) {
        checkFileForDuplicateExport(fullPath);
      }
    } catch (err) {
      console.error(`Error accessing ${fullPath}:`, err.message);
    }
  });
}

// Function to check file content for duplicate exports of 'setSessionContext'
function checkFileForDuplicateExport(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const exportRegex = /export\s+\{[^}]*setSessionContext[^}]*\}/g;
    const matches = content.match(exportRegex);

    if (matches && matches.length > 1) {
      console.log(`Duplicate export of 'setSessionContext' found in: ${filePath}`);
    }
  } catch (err) {
    console.error(`Error reading file ${filePath}:`, err.message);
  }
}

// Start the search
console.log(`Scanning directory: ${directoryPath}`);
searchFiles(directoryPath);
console.log('Scan complete.');

/*
Usage:
Run this script in your terminal with Node.js, providing the directory to scan:

node find_duplicate_exports.js /path/to/your/codebase

If no path is provided, it will scan the current directory by default.
*/
