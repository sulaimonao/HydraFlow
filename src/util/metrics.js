// src/util/metrics.js

function calculateMetrics(context) {
  // Default values for context properties
  const tokenUsage = context.tokenUsage || { used: 0, total: 8192 };
  const responseLatency = context.responseLatency || 0.8;
  const activeSubpersonas = context.activeSubpersonas || [];

  // Calculate remaining tokens and status
  const remaining = tokenUsage.total - tokenUsage.used;
  const status = remaining < 2000 ? "🟡 Warning Zone" : "🟢 Normal";

  // Return enriched metrics
  return {
    tokenUsage: {
      used: tokenUsage.used,
      total: tokenUsage.total,
      remaining,
      status,
    },
    engineLoad: "🟢 Normal", // Mocked for now
    latency: responseLatency,
    activeSubpersonas: activeSubpersonas.length,
    recommendations: remaining < 2000
      ? ["Reset context", "Simplify queries"]
      : [],
  };
}

module.exports = {
  calculateMetrics,
};
