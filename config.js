// config.js
import { fileURLToPath } from 'url';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

// Helper function to get the directory name
export function getDirname() {
  return path.dirname(fileURLToPath(import.meta.url));
}

const __dirname = getDirname();

// Database file path (store it in a 'data' directory)
const dbPath = path.resolve(__dirname, 'data/hydraflow.db');
const sessionsDbPath = path.resolve(__dirname, 'data/sessions.db');

const config = {
  dbPath, // Use the resolved path
  sessionsDbPath,
  __dirname, //added to be called in other files
  // ... other config options ...
};

export default config;