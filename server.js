// server.js (Local SQLite Version)
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
import { appendGaugeMetrics } from './middleware/metricsMiddleware.js';
import { sessionContext } from './middleware/sessionContext.js';
// REMOVE: Supabase-related imports
// import pg from 'pg';
// import connectPgSimple from 'connect-pg-simple';
import { fileURLToPath } from 'url'; // Import for __dirname fix
import sessionInitializer from './middleware/sessionInitializer.js';

const __filename = fileURLToPath(import.meta.url); // Get file path
const __dirname = path.dirname(__filename);       // Get directory path

dotenv.config();

const app = express();
app.use(express.json());

// 🛡️ Use SQLite for Session Store (simpler for local development)
import sqlite3 from 'sqlite3';
import connectSqlite3 from 'connect-sqlite3';

const SQLiteStore = connectSqlite3(session);
const sessionStore = new SQLiteStore({
  db: 'sessions.db', // Use a dedicated sessions database file
  dir: path.resolve(__dirname, 'data'), // Put it in the 'data' directory
  table: 'user_sessions', // You can customize the table name
  concurrentDB: true,
});

app.use(
    session({
        store: sessionStore,
        secret: process.env.SESSION_SECRET || 'your-secret-key', // Use .env for production
        resave: false,
        saveUninitialized: false,
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

app.use('/favicon.ico', express.static(path.join(__dirname, 'public', 'favicon.ico')));
app.use('/favicon.png', express.static(path.join(__dirname, 'public', 'favicon.png')));

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

// Serve the homepage
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running locally on port ${PORT}`);
});

export default app;