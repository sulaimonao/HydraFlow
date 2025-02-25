// config.js
import path from 'path';
import { fileURLToPath } from 'url';

let __dirname;

// Determine if the app is being tested, and modify __dirname accordingly
if (process.env.NODE_ENV === 'test') {
    // When running tests, __dirname should point to the project root.
    // We go up one level from the current file (which is in the root).
    __dirname = path.resolve(path.dirname(fileURLToPath(import.meta.url)), './');
     // The extra /.. gets us to the project root.
} else {
    // In normal (non-test) execution, __dirname is calculated as before.
    __dirname = path.dirname(fileURLToPath(import.meta.url));
}
export { __dirname };