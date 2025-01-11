// fix-supabase-requests.js

import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();

/**
 * Recursively scans directories for .js files, excluding node_modules.
 */
function getAllJSFiles(dir, files = []) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);

    // Skip node_modules and hidden folders
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && !file.startsWith('.')) {
        getAllJSFiles(fullPath, files);
      }
    } else if (file.endsWith('.js')) {
      files.push(fullPath);
    }
  });
  return files;
}

/**
 * Fixes incorrect supabaseRequest calls by wrapping them in a function.
 */
function fixSupabaseRequests() {
  const jsFiles = getAllJSFiles(projectRoot);

  jsFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf-8');
    let updatedContent = content;

    // Regex to detect incorrect supabaseRequest calls
    const regex = /supabaseRequest\(\s*supabase\.from\((.*?)\)\.(\w+)\((.*?)\)\s*\)/g;

    // Wrap supabaseRequest calls in a function
    updatedContent = updatedContent.replace(regex, (match, fromArgs, method, methodArgs) => {
      return `supabaseRequest(() => supabase.from(${fromArgs}).${method}(${methodArgs}))`;
    });

    // Save the file if changes were made
    if (content !== updatedContent) {
      fs.writeFileSync(file, updatedContent);
      console.log(`✅ Fixed supabaseRequest in ${file}`);
    }
  });

  console.log('🚀 Auto-fix for supabaseRequest completed! Node modules were ignored.');
}

// Run the fixer
fixSupabaseRequests();
