// config.js
import path from 'path';
import { fileURLToPath } from 'url';

// Export a FUNCTION that returns __dirname
export function getDirname() {
    let __dirname;
    if (process.env.NODE_ENV === 'test') {
        // IN TEST ENVIRONMENT: Use a hardcoded relative path
        __dirname = path.resolve('./'); // Points to project root
    } else {
        // In normal (non-test) execution, __dirname is calculated as before.
        __dirname = path.dirname(fileURLToPath(import.meta.url));
    }
    return __dirname;
}