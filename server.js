const express = require("express");
const feedbackRoutes = require("./routes/feedback");
const { calculateMetrics } = require("./src/util/metrics");

const app = express();
app.use(express.json());

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
