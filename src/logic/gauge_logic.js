// src/logic/gauge_logic.js
import { getContext, getMemory, getHeads } from "../state/context_state.js";

/**
 * Generates a snapshot of gauge data for the given user and chatroom.
 * @param {string} user_id - The user ID.
 * @param {string} chatroom_id - The chatroom ID.
 * @returns {Object} - The consolidated gauge data.
 */
export async function generateGaugeSnapshot(user_id, chatroom_id) {
  try {
    const context = await getContext(user_id, chatroom_id);
    const memory = await getMemory(user_id, chatroom_id);
    const heads = await getHeads(user_id, chatroom_id);

    return {
      priority: context.priority || "Normal",
      memoryUsage: memory.length,
      headCount: heads.length,
    };
  } catch (error) {
    console.error(`Error generating gauge snapshot: ${error.message}`);
    throw error;
  }
}
