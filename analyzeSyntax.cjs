const fs = require("fs");
const path = require("path");
const acorn = require("acorn");

// Directory to analyze
const baseDir = "/Users/akeemsulaimon/Documents/GitHub/HydraFlow";

// Function to recursively find .js files
function findJSFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    let stat;
    try {
      stat = fs.statSync(filePath);
    } catch (err) {
      console.error(`Error accessing file: ${filePath}`, err);
      return;
    }

    // Skip node_modules and other unwanted directories
    if (stat.isDirectory() && !filePath.includes("node_modules")) {
      findJSFiles(filePath, fileList);
    } else if (filePath.endsWith(".js")) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Function to check syntax of a JavaScript file
function checkSyntax(filePath) {
  try {
    const code = fs.readFileSync(filePath, "utf-8");
    acorn.parse(code, { ecmaVersion: "latest", sourceType: "module" });
    return { file: filePath, error: null };
  } catch (err) {
    return { file: filePath, error: err.message };
  }
}

// Main function
function analyzeJSFiles(dir) {
  console.log(`Analyzing JavaScript files in directory: ${dir}`);
  const jsFiles = findJSFiles(dir);
  const results = jsFiles.map((file) => checkSyntax(file));

  const errors = results.filter((result) => result.error);
  if (errors.length === 0) {
    console.log("✅ No syntax errors found.");
  } else {
    console.log(`❌ Found syntax errors in ${errors.length} files:\n`);
    errors.forEach((result) => {
      console.log(`File: ${result.file}`);
      console.log(`Error: ${result.error}\n`);
    });
  }
}

// Run analysis
analyzeJSFiles(baseDir);
