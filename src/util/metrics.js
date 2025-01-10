// src/util/metrics.js
import os from 'os';

export function calculateMetrics(context) {
  if (!context) throw new Error("Context data is missing");
  const { tokenUsage, responseLatency, activeSubpersonas } = context;

  if (!tokenUsage) throw new Error("Token usage data is missing");
  if (!responseLatency) throw new Error("Response latency data is missing");
  if (!activeSubpersonas) throw new Error("Active subpersonas data is missing");

  const tokenUsagePercentage = (tokenUsage.used / tokenUsage.total) * 100;
  const inputTokenUsage = tokenUsage.input || 0;
  const outputTokenUsage = tokenUsage.output || 0;
  const averageLatency = responseLatency;
  const activeSubpersonasCount = activeSubpersonas.length;

  const memoryUsageMB = process.memoryUsage().rss / (1024 * 1024); // in MB
  const cpuLoad = os.loadavg ? os.loadavg()[0] : 0; // Fallback for non-Unix
  const uptimeSeconds = process.uptime();

  // Health Status Check
  const healthStatus = {
    memory: memoryUsageMB > 1024 ? 'High' : 'Normal',
    cpu: cpuLoad > 1.5 ? 'High' : 'Normal',
    tokens: tokenUsagePercentage > 85 ? 'Critical' : 'Optimal',
  };

  // Determine actions based on metrics
  const actions = [];
  if (memoryUsageMB > 1024) actions.push('compressMemory');
  if (cpuLoad > 1.5) actions.push('prioritizeTasks');
  if (tokenUsagePercentage > 85) actions.push('limitResponses');
  if (averageLatency > 1) actions.push('simplifyResponses');

  return {
    tokenUsagePercentage,
    inputTokenUsage,
    outputTokenUsage,
    averageLatency,
    activeSubpersonasCount,
    memoryUsageMB,
    cpuLoad,
    uptimeSeconds,
    healthStatus,
    actions, // Include actions in the returned metrics
  };
}
