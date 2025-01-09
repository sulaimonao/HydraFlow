// src/util/metrics.js

export function calculateMetrics(context) {
  const { tokenUsage, responseLatency, activeSubpersonas } = context;

  const tokenUsagePercentage = (tokenUsage.used / tokenUsage.total) * 100;
  const averageLatency = responseLatency;
  const activeSubpersonasCount = activeSubpersonas.length;

  return {
    tokenUsagePercentage,
    averageLatency,
    activeSubpersonasCount,
  };
}
