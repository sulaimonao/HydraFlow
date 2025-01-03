// src/logic/gauge_logic.js
import { getContext } from "../state/context_state.js";
import { getMemory } from "../state/memory_state.js";
import { createOrFetchHead } from "../state/heads_state.js";

export async function generateGaugeSnapshot(user_id, chatroom_id) {
  try {
    const context = await getContext(user_id, chatroom_id);
    const memory = await getMemory(user_id, chatroom_id);
    const heads = await createOrFetchHead("gauge", "System awareness metrics", user_id, chatroom_id);

    return {
      priority: context.priority || "Normal",
      memoryUsage: memory.length,
      headCount: heads ? heads.length : 0,
    };
  } catch (error) {
    console.error(`Error generating gauge snapshot: ${error.message}`);
    throw error;
  }
}
