//src/util/recommendations.js
import { logInfo } from './logger.js';

/**
 * Generates context-aware system optimization recommendations.
 * @param {object} metrics - System metrics including user context.
 * @returns {Array} - List of actionable recommendations.
 */
export function generateRecommendations(metrics) {
  const { 
    tokenUsagePercentage, 
    averageLatency, 
    activeSubpersonasCount, 
    memoryUsageMB, 
    cpuLoad, 
    user_id = null, 
    chatroom_id = null 
  } = metrics;

  const recommendations = [];

  // 🔒 Log the context for traceability
  logInfo(`Generating recommendations for user: ${user_id}, chatroom: ${chatroom_id}`);

  // 🚀 Token usage optimization
  if (tokenUsagePercentage > 85) {
    recommendations.push("🔄 **Compress memory** or **limit responses** to reduce token usage.");
  } else if (tokenUsagePercentage > 70) {
    recommendations.push("⚠️ Monitor token usage and consider streamlining workflows.");
  }

  // ⏳ Response latency improvements
  if (averageLatency > 1.5) {
    recommendations.push("🚀 **Simplify responses** or **prioritize tasks** to improve response latency.");
  }

  // 🧠 Subpersona utilization
  if (activeSubpersonasCount < 3) {
    recommendations.push("🧩 Activate more subpersonas to balance workload and improve task efficiency.");
  }

  // 💾 Memory management
  if (memoryUsageMB > 1024) {
    recommendations.push("🗜️ High memory usage detected. **Compress memory** to optimize performance.");
  }

  // 🖥️ CPU load management
  if (cpuLoad > 1.5) {
    recommendations.push("⚙️ **Prioritize critical tasks** due to high CPU load.");
  }

  // ✅ If no critical issues are found
  if (recommendations.length === 0) {
    recommendations.push("✅ System is running optimally. No immediate actions required.");
  }

  return recommendations;
}
