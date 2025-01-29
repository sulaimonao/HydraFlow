// server.js
import express from 'express';
import session from 'express-session';
import path from 'path';
import dotenv from 'dotenv';
import feedbackRoutes from './routes/feedback_collector.js';
import { appendGaugeMetrics } from './middleware/metricsMiddleware.js';
import { sessionContext } from './middleware/sessionContext.js'; // Import sessionContext
import createSubpersona from './api/create-subpersona.js';
import compressMemory from './api/compress-memory.js';
import { runAutonomousWorkflow } from './main.js';
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

// Serve static files (Homepage)
app.use(express.static(path.join(process.cwd(), 'public')));

// Middleware for session context handling
app.use(sessionContext); // Apply sessionContext middleware to all routes

app.use(appendGaugeMetrics);

app.use('/favicon.ico', express.static('public/favicon.ico'));
app.use('/favicon.png', express.static('public/favicon.png'));

// 🔍 Parse Query API
app.post("/api/parse-query", (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Query is required." });

  const actionItems = [];
  if (query.includes("analyze logs")) actionItems.push("create-subpersona");
  if (query.includes("compress")) actionItems.push("compress-memory");

  res.status(200).json({ actionItems });
});

// 🤖 Autonomous Workflow API
app.post("/api/autonomous", async (req, res) => {
  try {
    if (!req.session || !req.session.userId || !req.session.chatroomId) {
      return res.status(400).json({ error: 'User ID and Chatroom ID are required.' });
    }

    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Query is required." });

    console.log(`🔍 req.session content: ${JSON.stringify(req.session)}`);
    const result = await runAutonomousWorkflow(query, req.session.userId, req.session.chatroomId); // Use session context
    res.status(200).json(result);
  } catch (error) {
    console.error("❌ Error in autonomous workflow:", error);
    res.status(500).json({ error: error.message });
  }
});

// 🔧 Create Subpersona API
app.post("/api/create-subpersona", async (req, res) => {
  try {
    if (!req.session || !req.session.userId || !req.session.chatroomId) {
      return res.status(400).json({ error: 'User ID and Chatroom ID are required.' });
    }

    const { name, capabilities, preferences } = req.body;
    await createSubpersona(name, req.session.userId, req.session.chatroomId, capabilities, preferences); // Use session context
    res.status(201).json({ message: "Subpersona created successfully." });
  } catch (error) {
    console.error("❌ Error creating subpersona:", error);
    res.status(500).json({ error: error.message });
  }
});

// 🔧 Compress Memory API
app.post("/api/compress-memory", async (req, res) => {
  try {
    if (!req.session || !req.session.userId || !req.session.chatroomId) {
      return res.status(400).json({ error: 'User ID and Chatroom ID are required.' });
    }

    const { memory } = req.body;
    const result = await compressMemory(memory, req.session.userId, req.session.chatroomId); // Use session context
    res.status(200).json(result);
  } catch (error) {
    console.error("❌ Error compressing memory:", error);
    res.status(500).json({ error: error.message });
  }
});

app.use("/api/feedback", feedbackRoutes);

// Serve the homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;
