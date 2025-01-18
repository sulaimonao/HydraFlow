// server.js
import express from 'express';
import session from 'express-session';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import supabase, { supabaseRequest, setSessionContext, createSession } from './lib/supabaseClient.js';
import feedbackRoutes from './routes/feedback_collector.js';
import { calculateMetrics } from './src/util/metrics.js';
import { appendGaugeMetrics } from './middleware/metricsMiddleware.js';
import { generateRecommendations } from './src/util/recommendations.js';
import { initializeUserContext } from './middleware/authMiddleware.js';
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

// 🌐 Enhanced Middleware to Initialize or Retrieve Sessions
app.use(async (req, res, next) => {
  try {
    const sessionHeader = req.headers['x-hydra-session-id'];
    let userId, chatroomId;

    if (sessionHeader && sessionHeader.includes(':')) {
      [userId, chatroomId] = sessionHeader.split(':');
      const { data: sessionData, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('chatroom_id', chatroomId)
        .single();

      if (error || !sessionData) {
        console.warn("⚠️ Invalid session ID.");
        return res.status(400).json({ error: "Invalid session ID." });
      }
      req.session.userId = userId;
      req.session.chatroomId = chatroomId;
      console.log(`🔐 Existing session: userId=${userId}, chatroomId=${chatroomId}`);
    } else {
      userId = uuidv4();
      chatroomId = uuidv4();
      req.session.userId = userId;
      req.session.chatroomId = chatroomId;
      await createSession(userId, chatroomId);
      res.setHeader('X-Hydra-Session-ID', `${userId}:${chatroomId}`);
      console.log(`✅ New session initialized: userId=${userId}, chatroomId=${chatroomId}`);
    }

    if (req.session.userId && req.session.chatroomId) {
      await setSessionContext(req.session.userId, req.session.chatroomId);
    } else {
      console.error("❌ Missing userId or chatroomId during session context setup.");
      return res.status(500).json({ error: "Session initialization failed." });
    }

    next();
  } catch (error) {
    console.error("❌ Error initializing session:", error);
    res.status(500).json({ error: 'Failed to initialize session.' });
  }
});

app.use(initializeUserContext);
app.use(appendGaugeMetrics);

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
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Query is required." });

    const result = await runAutonomousWorkflow(query);
    res.status(200).json(result);
  } catch (error) {
    console.error("❌ Error in autonomous workflow:", error);
    res.status(500).json({ error: error.message });
  }
});

// 🔧 Create Subpersona API
app.post("/api/create-subpersona", async (req, res) => {
  try {
    const { name, capabilities, preferences } = req.body;
    await createSubpersona(name, req.session.userId, req.session.chatroomId, capabilities, preferences);
    res.status(201).json({ message: "Subpersona created successfully." });
  } catch (error) {
    console.error("❌ Error creating subpersona:", error);
    res.status(500).json({ error: error.message });
  }
});

// 🔧 Compress Memory API
app.post("/api/compress-memory", compressMemory);

app.use("/api/feedback", feedbackRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;
