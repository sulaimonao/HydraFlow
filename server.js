// server.js
const express = require("express");
const session = require("express-session");
const { v4: uuidv4 } = require("uuid");
const feedbackRoutes = require("./routes/feedback");
const { calculateMetrics } = require("./src/util/metrics");
const { appendGaugeMetrics } = require("./middleware/metricsMiddleware");
const { generateRecommendations } = require("./src/util/recommendations"); // Import recommendations logic

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
app.use((req, res, next) => {
  if (!req.session.userId) {
    req.session.userId = uuidv4();
  }
  if (!req.session.chatroomId) {
    req.session.chatroomId = uuidv4();
  }
  next();
});

// Middleware to append gauge metrics to all responses
app.use(appendGaugeMetrics);

// Feedback routes
app.use("/api/feedback", feedbackRoutes);

// Fetch gauge metrics
app.get("/api/fetch-gauge-metrics", (req, res) => {
  const context = req.context || {
    tokenUsage: { used: 6000, total: 8192 },
    responseLatency: 0.8,
    activeSubpersonas: [
      { name: "LogAnalyzer", status: "active" },
      { name: "MemoryOptimizer", status: "idle" },
    ],
  };
  const metrics = calculateMetrics(context);
  res.json({ ...metrics, gaugeMetrics: res.locals.gaugeMetrics });
});

// Recommendations API
app.get("/api/recommendations", (req, res) => {
  try {
    const gaugeMetrics = res.locals.gaugeMetrics || {}; // Fallback if metrics are missing
    const recommendations = generateRecommendations(gaugeMetrics);

    res.status(200).json({ recommendations, gaugeMetrics });
  } catch (error) {
    console.error("Error generating recommendations:", error);
    res.status(500).json({ error: "Failed to generate recommendations." });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
