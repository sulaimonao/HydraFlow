// fix-supabase-issues.js
import fs from 'fs';
import path from 'path';

// Scan the entire project (excluding node_modules)
const projectRoot = process.cwd();

function getAllJSFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory() && file !== 'node_modules') {
      arrayOfFiles = getAllJSFiles(fullPath, arrayOfFiles);
    } else if (file.endsWith('.js')) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

// Fix supabaseRequest without function wrapper
function fixSupabaseRequest(content) {
  const regex = /supabaseRequest\(\s*supabase\.from\((.*?)\)\.select\((.*?)\)(.*?)\)/gs;
  return content.replace(regex, (match, table, select, rest) => {
    return `supabaseRequest(() => supabase.from(${table}).select(${select})${rest})`;
  });
}

// Fix missing generatedUserId declarations
function fixGeneratedUserId(content) {
  if (content.includes('generatedUserId') && !content.includes('const generatedUserId')) {
    const uuidImport = `import { v4 as uuidv4 } from 'uuid';\n`;
    const definition = `const generatedUserId = uuidv4();\n`;

    if (!content.includes("import { v4 as uuidv4 } from 'uuid'")) {
      content = uuidImport + content;
    }
    content = content.replace(/(orchestrateContextWorkflow.*?\{)/s, `$1\n  ${definition}`);
  }
  return content;
}

// Main function to scan and fix files
function autoFixIssues() {
  const jsFiles = getAllJSFiles(projectRoot);

  jsFiles.forEach((file) => {
    let content = fs.readFileSync(file, 'utf-8');
    let updatedContent = content;

    // Apply fixes
    updatedContent = fixSupabaseRequest(updatedContent);
    updatedContent = fixGeneratedUserId(updatedContent);

    if (content !== updatedContent) {
      fs.writeFileSync(file, updatedContent, 'utf-8');
      console.log(`✅ Fixed issues in ${file}`);
    }
  });

  console.log('🚀 Auto-fix completed for Supabase issues!');
}

// Run the fixer
autoFixIssues();
