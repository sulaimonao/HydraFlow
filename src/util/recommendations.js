//src/util/recommendations.js

export function generateRecommendations(metrics) {
  const { tokenUsagePercentage, averageLatency, activeSubpersonasCount } = metrics;

  const recommendations = [];

  if (tokenUsagePercentage > 80) {
    recommendations.push("Consider optimizing token usage to avoid exceeding limits.");
  }

  if (averageLatency > 1) {
    recommendations.push("Improve response latency for better performance.");
  }

  if (activeSubpersonasCount < 3) {
    recommendations.push("Increase the number of active subpersonas for better task distribution.");
  }

  return recommendations;
}