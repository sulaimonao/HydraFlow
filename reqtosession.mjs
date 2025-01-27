import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Convert import.meta.url to __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Recursively scan a directory for JavaScript files.
 * @param {string} dir - The directory to scan.
 * @returns {string[]} - An array of file paths.
 */
function getJavaScriptFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        results = results.concat(getJavaScriptFiles(filePath));
      }
    } else if (file.endsWith('.js')) {
      results.push(filePath);
    }
  });

  return results;
}

/**
 * Replace all occurrences of `req.locals` with `req.session` in a file.
 * @param {string} filePath - The file path.
 */
function replaceLocalsWithSession(filePath) {
  const data = fs.readFileSync(filePath, 'utf8');
  const result = data.replace(/req\.locals/g, 'req.session');
  fs.writeFileSync(filePath, result, 'utf8');
}

/**
 * Main function to update all files in the project.
 * @param {string} projectDir - The root directory of the project.
 */
function updateProjectFiles(projectDir) {
  const files = getJavaScriptFiles(projectDir);
  files.forEach(file => replaceLocalsWithSession(file));
  console.log('🎉 All files processed.');
}

// Example usage
const projectDirectory = path.join(__dirname, '/'); // Replace with your project root
updateProjectFiles(projectDirectory);
