const express = require("express");
const session = require("express-session");
const { v4: uuidv4 } = require("uuid");
const feedbackRoutes = require("./routes/feedback");
const { calculateMetrics } = require("./src/util/metrics");

const app = express();
app.use(express.json());

// Use session middleware
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));

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

// Feedback routes
app.use("/api/feedback", feedbackRoutes);

// Fetch gauge metrics
app.get("/api/fetch-gauge-metrics", (req, res) => {
  const context = req.context || {
    tokenUsage: { used: 6000, total: 8192 },
    responseLatency: 0.8,
  };
  const metrics = calculateMetrics(context);
  res.json(metrics);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
