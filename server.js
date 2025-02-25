// server.js
import express from 'express';
import session from 'express-session';
import path from 'path';
import dotenv from 'dotenv';
import feedbackRoutes from './routes/feedback_collector.js';
import debugRoutes from './api/debug.js';
import fetchGaugeMetricsRoutes from './api/fetch-gauge-metrics.js';
import createSubpersonaRoutes from './api/create-subpersona.js';
import recommendationsRoutes from './api/recommendations.js';
import parseQueryRoutes from './api/parse-query.js';
import taskRoutes from './api/task.js';
import contextRecapRoutes from './api/context-recap.js';
import compressMemoryRoutes from './api/compress-memory.js';
import autonomousRoutes from './api/autonomous.js';
import summarizeLogsRoutes from './api/summarize-logs.js';
import { appendGaugeMetrics } from './middleware/metricsMiddleware.js';
import { sessionContext } from './middleware/sessionContext.js';
import sessionInitializer from './middleware/sessionInitializer.js';
import { getDirname } from './config.js'; // Get config.
import config from './config.js';        // DEFAULT import for config
import connectSqlite3 from 'connect-sqlite3';
import fs from 'fs'; // Import the 'fs' module


const __dirname = getDirname(); // <-- Get __dirname by calling the function

dotenv.config();

const app = express();
app.use(express.json());

// 🛡️ Use SQLite for Session Store (simpler for local development)

const SQLiteStore = connectSqlite3(session);

// --- CRUCIAL CHANGE ---
// Ensure the 'data' directory exists
const dataDir = path.resolve(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir); // Create the directory if it doesn't exist
}

// Use config.sessionsDbPath here, consistent with the db.js change
const sessionStore = new SQLiteStore({
  db: path.basename(config.sessionsDbPath), // Use ONLY the filename here
  dir: dataDir,       // Use the absolute path to the 'data' directory
  table: 'user_sessions', // You can customize the table name
  concurrentDB: true,
});



app.use(
    session({
        store: sessionStore,
        secret: process.env.SESSION_SECRET || 'your-secret-key', // Use .env for production
        resave: false,
        saveUninitialized: false,  // Changed to false, as it's generally recommended
        cookie: {
            // secure: process.env.NODE_ENV === 'production', // Only set 'secure' in production (HTTPS)
            secure: false,  // For local development, keep secure as false
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // Session duration
        },
    })
);

// initialize session with default values
app.use(sessionInitializer);

// Middleware for session context handling
app.use(sessionContext); // Apply sessionContext middleware to all routes
app.use(appendGaugeMetrics);

app.use('/favicon.ico', express.static(path.join(__dirname, 'public', 'favicon.ico'))); // Use the imported __dirname
app.use('/favicon.png', express.static(path.join(__dirname, 'public', 'favicon.png')));  // Use the imported __dirname

// Register routes (all your API endpoints)
app.use('/api/feedback', feedbackRoutes);
app.use('/api/debug', debugRoutes);
app.use('/api/fetch-gauge-metrics', fetchGaugeMetricsRoutes);
app.use('/api/create-subpersona', createSubpersonaRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/parse-query', parseQueryRoutes);
app.use('/api/task', taskRoutes);
app.use('/api/context-recap', contextRecapRoutes);
app.use('/api/compress-memory', compressMemoryRoutes);
app.use('/api/autonomous', autonomousRoutes);
app.use('/api/summarize-logs', summarizeLogsRoutes);

// Serve the homepage
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html")); // Use the imported __dirname
});

const PORT = process.env.PORT || 3000;

// Only start listening if not in test environment
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`🚀 Server running locally on port ${PORT}`);
    });
}


export default app;