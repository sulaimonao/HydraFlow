// api/gauge.js 
import { logError, logInfo } from "../util/logger.js";
import { getContext } from "../state/context_state.js";
import { getMemory, getHeads } from "../state/memory_state.js";

export async function fetchGaugeData({ userId, chatroomId }) {
  try {
    const gaugeSnapshot = await generateGaugeSnapshot(userId, chatroomId);
    logInfo("Gauge data fetched successfully.", gaugeSnapshot);
    return gaugeSnapshot;
  } catch (error) {
    logError(`Failed to fetch gauge data: ${error.message}`);
    throw error;
  }
}

async function generateGaugeSnapshot(userId, chatroomId) {
  try {
    const context = await getContext(userId, chatroomId);
    const memory = await getMemory(userId, chatroomId);
    const heads = await getHeads(userId, chatroomId);

    return {
      priority: context.priority || "Normal",
      memoryUsage: memory.length,
      headCount: heads.length,
      activeTasksCount: await fetchActiveTasksCount(userId, chatroomId),
    };
  } catch (error) {
    logError(`Failed to generate gauge snapshot: ${error.message}`);
    throw error;
  }
}

async function fetchActiveTasksCount(userId, chatroomId) {
  // Placeholder for fetching active tasks count
  return 5;
}
