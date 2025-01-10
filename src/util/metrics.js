// src/util/metrics.js
export function calculateMetrics(context) {
  if (!context || !context.tokenUsage || !context.responseLatency || !context.activeSubpersonas) {
    throw new Error("Invalid context data for metrics calculation");
  }

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
