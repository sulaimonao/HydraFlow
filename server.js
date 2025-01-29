// server.js
import express from 'express';
import session from 'express-session';
import path from 'path';
import dotenv from 'dotenv';
import feedbackRoutes from './routes/feedback_collector.js';
import debugRoutes from './api/debug.js'; // Import debug routes
import fetchGaugeMetricsRoutes from './api/fetch-gauge-metrics.js'; // Import fetch-gauge-metrics routes
import createSubpersonaRoutes from './api/create-subpersona.js'; // Import create-subpersona routes
import recommendationsRoutes from './api/recommendations.js'; // Import recommendations routes
import parseQueryRoutes from './api/parse-query.js'; // Import parse-query routes
import taskRoutes from './api/task.js'; // Import task routes
import contextRecapRoutes from './api/context-recap.js'; // Import context-recap routes
import compressMemoryRoutes from './api/compress-memory.js'; // Import compress-memory routes
import autonomousRoutes from './api/autonomous.js'; // Import autonomous routes
import { appendGaugeMetrics } from './middleware/metricsMiddleware.js';
import { sessionContext } from './middleware/sessionContext.js'; // Import sessionContext
import pg from 'pg';
import connectPgSimple from 'connect-pg-simple';

dotenv.config();

const app = express();
app.use(express.json());

// 🛡️ Production-Ready Session Store
const pgSession = connectPgSimple(session);
const pgPool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(
  session({
    store: new pgSession({
      pool: pgPool,
      tableName: 'user_sessions',
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Middleware for session context handling
app.use(sessionContext); // Apply sessionContext middleware to all routes
app.use(appendGaugeMetrics);

app.use('/favicon.ico', express.static('public/favicon.ico'));
app.use('/favicon.png', express.static('public/favicon.png'));

// Register routes
app.use('/api/feedback', feedbackRoutes);
app.use('/api/debug', debugRoutes); // Register debug routes
app.use('/api/fetch-gauge-metrics', fetchGaugeMetricsRoutes); // Register fetch-gauge-metrics routes
app.use('/api/create-subpersona', createSubpersonaRoutes); // Register create-subpersona routes
app.use('/api/recommendations', recommendationsRoutes); // Register recommendations routes
app.use('/api/parse-query', parseQueryRoutes); // Register parse-query routes
app.use('/api/task', taskRoutes); // Register task routes
app.use('/api/context-recap', contextRecapRoutes); // Register context-recap routes
app.use('/api/compress-memory', compressMemoryRoutes); // Register compress-memory routes
app.use('/api/autonomous', autonomousRoutes); // Register autonomous routes

// Serve the homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;
