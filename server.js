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

dotenv.config();

const app = express();
app.use(express.json());

// 🔒 Secure Session Management Middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,  // ✅ Securely stored in .env
    resave: false,
    saveUninitialized: true,
  })
);

// 🌐 Initialize User and Chatroom Sessions in Supabase
app.use(async (req, res, next) => {
  // Check if userId and chatroomId exist in the session
  if (!req.session.userId || !req.session.chatroomId) {
    const userId = uuidv4();
    const chatroomId = uuidv4();

    req.session.userId = userId;
    req.session.chatroomId = chatroomId;

    await createSession(userId, chatroomId);
    if (!req.session.userId || !req.session.chatroomId) {
      throw new Error("Failed to create session in Supabase");
    }
    console.log(`✅ Session initialized: userId=${userId}, chatroomId=${chatroomId}`);
  }

  req.userId = req.session.userId;
  req.chatroomId = req.session.chatroomId;
  req.context = { userId: req.userId, chatroomId: req.chatroomId }; // Improved context

  await setSessionContext(req.userId, req.chatroomId);
  next();
});

// 🌐 Middleware for Context and Metrics
app.use(initializeUserContext);
app.use(appendGaugeMetrics);

// 📋 Validation Schemas
const createSubpersonaSchema = Joi.object({
  name: Joi.string().required(),
  capabilities: Joi.object().required(),
  preferences: Joi.object().required(),
});

const compressMemorySchema = Joi.object({
  memory: Joi.string().required(),
  threshold: Joi.number().optional(),
  data: Joi.object().optional(),
  gaugeMetrics: Joi.object().required(),
});

// 🛡️ Input Validation Middleware
const validateInput = (requiredFields) => (req, res, next) => {
  for (let field of requiredFields) {
    if (!req.body[field]) {
      return res.status(400).json({ error: `${field} is required.` });
    }
  }
  next();
};

// 🔧 Create Subpersona API
app.post(
  "/api/create-subpersona",
  validateInput(['name']),
  validateRequest(createSubpersonaSchema),
  async (req, res) => {
    try {
      const { name, capabilities, preferences } = req.body;

      await createSubpersona(name, req.userId, req.chatroomId, capabilities, preferences);

      res.status(201).json({ message: "Subpersona created successfully." });
    } catch (error) {
      console.error("❌ Error creating subpersona:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// 🔧 Compress Memory API
app.post("/api/compress-memory", validateRequest(compressMemorySchema), compressMemory);

// 📝 Feedback Routes
app.use("/api/feedback", feedbackRoutes);

// 📊 Fetch Gauge Metrics API
app.get("/api/fetch-gauge-metrics", (req, res) => {
  const context = req.context || {
    tokenUsage: { used: 0, total: 10000 },
    responseLatency: 0.5,
    activeSubpersonas: [],
  };
  const metrics = calculateMetrics(context);
  res.json({ ...metrics, gaugeMetrics: res.locals.gaugeMetrics });
});

// 💡 Recommendations API
app.get("/api/recommendations", (req, res) => {
  try {
    const gaugeMetrics = res.locals.gaugeMetrics || {};
    const recommendations = generateRecommendations(gaugeMetrics);
    res.status(200).json({ recommendations, gaugeMetrics });
  } catch (error) {
    console.error("❌ Error generating recommendations:", error);
    res.status(500).json({ error: "Failed to generate recommendations." });
  }
});

// 🚨 Global Error Handler
const errorHandler = (err, req, res, next) => {
  console.error("❌ Unhandled Error:", err.stack);
  res.status(500).json({ error: 'Internal Server Error. Please try again later.' });
};

app.use(errorHandler);

// 🚀 Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;
