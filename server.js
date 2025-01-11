// server.js
import express from 'express';
import session from 'express-session';
import { v4 as uuidv4 } from 'uuid';
import feedbackRoutes from './routes/feedback_collector.js';
import { calculateMetrics } from './src/util/metrics.js';
import { appendGaugeMetrics } from './middleware/metricsMiddleware.js';
import { generateRecommendations } from './src/util/recommendations.js';
import { validateRequest } from './middleware/validationMiddleware.js';
import Joi from 'joi';
import createSubpersona from './api/create-subpersona.js';
import compressMemory from './api/compress-memory.js';
import supabase, { supabaseRequest } from './lib/supabaseClient.js';

const app = express();
app.use(express.json());

// Use session middleware
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

// Middleware to initialize user and chatroom data
app.use(async (req, res, next) => {
  try {
    if (!req.session.userId) {
      req.session.userId = uuidv4();  // ✅ Ensure user_id is always set
    }
    if (!req.session.chatroomId) {
      req.session.chatroomId = uuidv4();
    }    

    // Ensure context exists in Supabase
    const { data, error } = await supabase
      .from('contexts')
      .select('id')
      .eq('user_id', req.session.userId)
      .eq('chatroom_id', req.session.chatroomId)
      .single();

    if (error || !data) {
      await supabase
        .from('contexts')
        .insert([{ user_id: req.session.userId, chatroom_id: req.session.chatroomId }]);
    }

    next();
  } catch (error) {
    console.error("Error initializing context:", error);
    next();
  }
});

// Middleware to append gauge metrics to all responses
app.use(appendGaugeMetrics);

// Define validation schemas
const createSubpersonaSchema = Joi.object({
  name: Joi.string().required(),
  capabilities: Joi.object().required(),
  preferences: Joi.object().required(),
  user_id: Joi.string().optional(),
  chatroom_id: Joi.string().optional(),
});

const compressMemorySchema = Joi.object({
  memory: Joi.string().required(),
  threshold: Joi.number().optional(),
  data: Joi.object().optional(),
});

// Input validation middleware
const validateInput = (requiredFields) => (req, res, next) => {
  for (let field of requiredFields) {
    if (!req.body[field]) {
      return res.status(400).json({ error: `${field} is required.` });
    }
  }
  next();
};

// Use validation middleware
app.post("/api/create-subpersona", validateInput(['name']), validateRequest(createSubpersonaSchema), createSubpersona);
app.post("/api/compress-memory", validateRequest(compressMemorySchema), compressMemory);

// Feedback routes
app.use("/api/feedback", feedbackRoutes);

// Fetch gauge metrics
app.get("/api/fetch-gauge-metrics", (req, res) => {
  const context = req.context || {
    tokenUsage: { used: 0, total: 10000 },
    responseLatency: 0.5,
    activeSubpersonas: [],
  };
  const metrics = calculateMetrics(context);
  res.json({ ...metrics, gaugeMetrics: res.locals.gaugeMetrics });
});

// Recommendations API
app.get("/api/recommendations", (req, res) => {
  try {
    const gaugeMetrics = res.locals.gaugeMetrics || {};
    const recommendations = generateRecommendations(gaugeMetrics);

    res.status(200).json({ recommendations, gaugeMetrics });
  } catch (error) {
    console.error("Error generating recommendations:", error);
    res.status(500).json({ error: "Failed to generate recommendations." });
  }
});

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error. Please try again later.' });
};

app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
