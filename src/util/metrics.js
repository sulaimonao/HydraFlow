//src/util/metrics.js

function calculateMetrics(context) {
  const tokenUsage = context.tokenUsage || { used: 0, total: 8192 };
  const remaining = tokenUsage.total - tokenUsage.used;
  const status = remaining < 2000 ? "🟡 Warning Zone" : "🟢 Normal";

  return {
    tokenUsage: {
      used: tokenUsage.used,
      total: tokenUsage.total,
      remaining,
      status,
    },
    engineLoad: "🟢 Normal", // Mocked for now
    latency: context.responseLatency || 0.8, // Mocked for now
    recommendations: remaining < 2000 ? ["Reset context", "Simplify queries"] : [],
  };
}

module.exports = {
  calculateMetrics,
};
