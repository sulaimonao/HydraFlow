// api/gauge.js 
import { logError } from './logger.js';
import { getContext } from '../state/context_state.js';
import { getMemory, getHeads } from '../state/memory_state.js';

export async function fetchGaugeData({ userId, chatroomId }) {
  try {
    const gaugeSnapshot = await generateGaugeSnapshot(userId, chatroomId);
    return gaugeSnapshot;
  } catch (error) {
    logError(`Failed to fetch gauge data: ${error.message}`);
    throw error;
  }
}

export async function generateGaugeSnapshot(userId, chatroomId) {
  try {
    const context = await getContext(userId, chatroomId);
    const memory = await getMemory(userId, chatroomId);
    const heads = await getHeads(userId, chatroomId);
    return {
      priority: context.priority || "Normal",
      keywords: context.keywords || [],
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
  // Placeholder for active task fetching logic
  return 5; // Example static return for testing
}
