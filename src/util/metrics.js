// src/util/metrics.js
import os from 'os';
import { logInfo, logError } from './logger.js';

// 🔧 Configurable thresholds for system health
const MEMORY_THRESHOLD_MB = process.env.MEMORY_THRESHOLD_MB || 1024;
const CPU_LOAD_THRESHOLD = process.env.CPU_LOAD_THRESHOLD || 1.5;
const TOKEN_USAGE_THRESHOLD = process.env.TOKEN_USAGE_THRESHOLD || 85;
const LATENCY_THRESHOLD = process.env.LATENCY_THRESHOLD || 1;

/**
 * 📊 Calculates system and operational metrics with user context.
 */
export function calculateMetrics(context, req) {
  if (!context) throw new Error("❗ Context data is missing");
  if (!req.session || !req.session.userId || !req.session.chatroomId) {
    throw new Error("❗ Session context is missing");
  }

  const { tokenUsage, responseLatency, activeSubpersonas = [] } = context;

  // 🔍 Validate essential data
  validateTokenUsage(tokenUsage);
  if (responseLatency === undefined || responseLatency === null) throw new Error("❗ Response latency data is missing");

  // 📈 Compute system metrics
  const tokenUsagePercentage = ((tokenUsage.used || 0) / (tokenUsage.total || 1)) * 100;
  const inputTokenUsage = tokenUsage.input || 0;
  const outputTokenUsage = tokenUsage.output || 0;
  const memoryUsageMB = process.memoryUsage().rss / (1024 * 1024); // Memory in MB
  const cpuLoad = os.loadavg ? os.loadavg()[0] : 0; // CPU load (fallback for non-Unix)
  const uptimeSeconds = process.uptime();

  // 🩺 Health analysis
  const healthStatus = {
    memory: memoryUsageMB > MEMORY_THRESHOLD_MB ? 'High' : 'Normal',
    cpu: cpuLoad > CPU_LOAD_THRESHOLD ? 'High' : 'Normal',
    tokens: tokenUsagePercentage > TOKEN_USAGE_THRESHOLD ? 'Critical' : 'Optimal',
    latency: responseLatency > LATENCY_THRESHOLD ? 'High' : 'Normal',
  };

  // ⚡ Proactive action recommendations
  const actions = prioritizeActions([
    { condition: memoryUsageMB > MEMORY_THRESHOLD_MB, action: 'compressMemory' },
    { condition: cpuLoad > CPU_LOAD_THRESHOLD, action: 'prioritizeTasks' },
    { condition: tokenUsagePercentage > TOKEN_USAGE_THRESHOLD, action: 'limitResponses' },
    { condition: responseLatency > LATENCY_THRESHOLD, action: 'simplifyResponses' },
  ]);

  // 📝 Detailed logging
  logInfo(`📊 Metrics calculated for user: ${req.session.userId}, chatroom: ${req.session.chatroomId}`);
  logInfo(`🔍 Health Status: ${JSON.stringify(healthStatus)}`);
  logInfo(`⚙️ Recommended Actions: ${actions.join(', ')}`);

  return {
    user_id: req.session.userId,
    chatroom_id: req.session.chatroomId,
    tokenUsagePercentage: tokenUsagePercentage.toFixed(2),
    inputTokenUsage,
    outputTokenUsage,
    averageLatency: responseLatency,
    activeSubpersonasCount: activeSubpersonas.length,
    memoryUsageMB: memoryUsageMB.toFixed(2),
    cpuLoad: cpuLoad.toFixed(2),
    uptimeSeconds,
    healthStatus,
    actions,
  };
}

/**
 * ✅ Validates token usage structure to prevent runtime errors.
 */
function validateTokenUsage(tokenUsage) {
  if (!tokenUsage || typeof tokenUsage.used !== 'number' || typeof tokenUsage.total !== 'number') {
    throw new Error("❗ Invalid token usage data. 'used' and 'total' must be numbers.");
  }
}

/**
 * ⚡ Prioritizes actions by severity.
 */
function prioritizeActions(actionChecks) {
  return actionChecks
    .filter(item => item.condition)
    .map(item => item.action)
    .sort((a, b) => {
      const priorityOrder = {
        'limitResponses': 1,
        'compressMemory': 2,
        'prioritizeTasks': 3,
        'simplifyResponses': 4,
      };
      return priorityOrder[a] - priorityOrder[b];
    });
}
