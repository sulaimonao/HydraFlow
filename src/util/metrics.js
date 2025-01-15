// src/util/metrics.js
import os from 'os';
import { logInfo, logError } from './logger.js';

/**
 * Calculates system and operational metrics with user context.
 * @param {object} context - Contains tokenUsage, responseLatency, activeSubpersonas, user_id, chatroom_id.
 * @returns {object} - Computed metrics and recommended actions.
 */
export function calculateMetrics(context) {
  if (!context) throw new Error("Context data is missing");
  
  const { tokenUsage, responseLatency, activeSubpersonas, user_id = null, chatroom_id = null } = context;

  // Validation of essential data
  if (!tokenUsage) throw new Error("Token usage data is missing");
  if (!responseLatency) throw new Error("Response latency data is missing");
  if (!activeSubpersonas) throw new Error("Active subpersonas data is missing");

  // Token usage metrics
  const tokenUsagePercentage = (tokenUsage.used / tokenUsage.total) * 100;
  const inputTokenUsage = tokenUsage.input || 0;
  const outputTokenUsage = tokenUsage.output || 0;

  // System performance metrics
  const memoryUsageMB = process.memoryUsage().rss / (1024 * 1024); // Memory in MB
  const cpuLoad = os.loadavg ? os.loadavg()[0] : 0; // CPU load (fallback for non-Unix)
  const uptimeSeconds = process.uptime(); // Server uptime

  // Health status analysis
  const healthStatus = {
    memory: memoryUsageMB > 1024 ? 'High' : 'Normal',
    cpu: cpuLoad > 1.5 ? 'High' : 'Normal',
    tokens: tokenUsagePercentage > 85 ? 'Critical' : 'Optimal',
    latency: responseLatency > 1 ? 'High' : 'Normal',
  };

  // Proactive action recommendations based on metrics
  const actions = [];
  if (memoryUsageMB > 1024) actions.push('compressMemory');
  if (cpuLoad > 1.5) actions.push('prioritizeTasks');
  if (tokenUsagePercentage > 85) actions.push('limitResponses');
  if (responseLatency > 1) actions.push('simplifyResponses');

  // Logging system health with user context
  logInfo(`Metrics calculated for user: ${user_id}, chatroom: ${chatroom_id}`);
  logInfo(`Memory Usage: ${memoryUsageMB.toFixed(2)} MB, CPU Load: ${cpuLoad.toFixed(2)}, Token Usage: ${tokenUsagePercentage.toFixed(2)}%`);

  return {
    user_id,
    chatroom_id,
    tokenUsagePercentage,
    inputTokenUsage,
    outputTokenUsage,
    averageLatency: responseLatency,
    activeSubpersonasCount: activeSubpersonas.length,
    memoryUsageMB,
    cpuLoad,
    uptimeSeconds,
    healthStatus,
    actions, // Context-aware actions for workflow manager
  };
}
