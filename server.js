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
import { validateRequest } from './middleware/validationMiddleware.js';
import { initializeUserContext } from './middleware/authMiddleware.js';
import Joi from 'joi';
import createSubpersona from './api/create-subpersona.js';
import compressMemory from './api/compress-memory.js';
import { runAutonomousWorkflow } from './main.js';

dotenv.config();

const app = express();
app.use(express.json());

// 🔒 Secure Session Management Middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
  })
);

// 🌐 Enhanced Middleware to Initialize or Retrieve Sessions
app.use(async (req, res, next) => {
  try {
    const existingSessionId = req.headers['x-hydra-session-id'];

    if (existingSessionId) {
      const { data: sessionData, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('id', existingSessionId)
        .single();

      if (error || !sessionData) {
        console.warn("⚠️ Invalid or expired session ID.");
        return res.status(400).json({ error: "Invalid session ID." });
      }

      req.userId = sessionData.user_id;
      req.chatroomId = sessionData.chatroom_id;
      console.log(`🔐 Existing session: userId=${req.userId}, chatroomId=${req.chatroomId}`);
    } else {
      const userId = uuidv4();
      const chatroomId = uuidv4();

      req.session.userId = userId;
      req.session.chatroomId = chatroomId;

      await createSession(userId, chatroomId);
      res.setHeader('X-Hydra-Session-ID', userId);
      console.log(`✅ New session initialized: userId=${userId}, chatroomId=${chatroomId}`);
    }

    if (req.userId && req.chatroomId) {
      await setSessionContext(req.userId, req.chatroomId);
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
  if (!query) {
    return res.status(400).json({ error: "Query is required." });
  }

  const actionItems = [];
  if (query.includes("analyze logs")) actionItems.push("create-subpersona");
  if (query.includes("compress")) actionItems.push("compress-memory");

  res.status(200).json({ actionItems });
});

// 🤖 Autonomous Workflow API
app.post("/api/autonomous", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Query is required." });
    }

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
    await createSubpersona(name, req.userId, req.chatroomId, capabilities, preferences);
    res.status(201).json({ message: "Subpersona created successfully." });
  } catch (error) {
    console.error("❌ Error creating subpersona:", error);
    res.status(500).json({ error: error.message });
  }
});

// 🔧 Compress Memory API
app.post("/api/compress-memory", compressMemory);
app.use("/api/feedback", feedbackRoutes);

app.get("/api/fetch-gauge-metrics", (req, res) => {
  const metrics = calculateMetrics(req.context || {});
  res.json({ ...metrics, gaugeMetrics: res.locals.gaugeMetrics });
});

app.get("/api/recommendations", (req, res) => {
  try {
    const recommendations = generateRecommendations(res.locals.gaugeMetrics || {});
    res.status(200).json({ recommendations });
  } catch (error) {
    console.error("❌ Error generating recommendations:", error);
    res.status(500).json({ error: "Failed to generate recommendations." });
  }
});

app.use((err, req, res, next) => {
  console.error("❌ Unhandled Error:", err.stack);
  res.status(500).json({ error: 'Internal Server Error.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;
