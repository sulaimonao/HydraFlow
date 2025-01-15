//src/util/recommendations.js
import { logInfo } from './logger.js';

// 🔧 Configurable system thresholds
const TOKEN_USAGE_CRITICAL = process.env.TOKEN_USAGE_CRITICAL || 85;
const TOKEN_USAGE_WARNING = process.env.TOKEN_USAGE_WARNING || 70;
const LATENCY_THRESHOLD = process.env.LATENCY_THRESHOLD || 1.5;
const MEMORY_THRESHOLD_MB = process.env.MEMORY_THRESHOLD_MB || 1024;
const CPU_LOAD_THRESHOLD = process.env.CPU_LOAD_THRESHOLD || 1.5;

/**
 * 📊 Generates context-aware system optimization recommendations.
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

  // 🔒 Log context for traceability
  logInfo(`📊 Generating recommendations for user: ${user_id}, chatroom: ${chatroom_id}`);

  // 🚀 Token usage optimization
  if (tokenUsagePercentage > TOKEN_USAGE_CRITICAL) {
    recommendations.push({
      priority: 1,
      suggestion: "🔄 **Compress memory** or **limit responses** to reduce token usage."
    });
  } else if (tokenUsagePercentage > TOKEN_USAGE_WARNING) {
    recommendations.push({
      priority: 2,
      suggestion: "⚠️ Monitor token usage and consider streamlining workflows."
    });
  }

  // ⏳ Response latency improvements
  if (averageLatency > LATENCY_THRESHOLD) {
    recommendations.push({
      priority: 1,
      suggestion: "🚀 **Simplify responses** or **prioritize tasks** to improve response latency."
    });
  }

  // 🧠 Subpersona utilization
  if (activeSubpersonasCount < 3) {
    recommendations.push({
      priority: 3,
      suggestion: "🧩 Activate more subpersonas to balance workload and improve task efficiency."
    });
  }

  // 💾 Memory management
  if (memoryUsageMB > MEMORY_THRESHOLD_MB) {
    recommendations.push({
      priority: 1,
      suggestion: "🗜️ High memory usage detected. **Compress memory** to optimize performance."
    });
  }

  // 🖥️ CPU load management
  if (cpuLoad > CPU_LOAD_THRESHOLD) {
    recommendations.push({
      priority: 1,
      suggestion: "⚙️ **Prioritize critical tasks** due to high CPU load."
    });
  }

  // ✅ If no critical issues are detected
  if (recommendations.length === 0) {
    recommendations.push({
      priority: 4,
      suggestion: "✅ System is running optimally. No immediate actions required."
    });
  }

  // 🔢 Sort recommendations by priority
  return recommendations.sort((a, b) => a.priority - b.priority).map(r => r.suggestion);
}
