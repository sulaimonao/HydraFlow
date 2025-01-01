// src/logic/gauge_logic.js
import { getContext } from "../state/context_state.js";
import { getMemory } from "../state/memory_state.js";
import { getHeads } from "../state/heads_state.js";
import { supabase } from "../../lib/db.js";

/**
 * Gathers an instrument cluster / gauge snapshot for the given user & chatroom:
 *  - Context priority and keywords
 *  - Memory usage
 *  - Number of heads (sub-personas)
 *  - Number of active tasks
 *
 * @param {string} user_id - The user ID.
 * @param {string} chatroom_id - The chatroom ID.
 * @returns {Object} - A consolidated snapshot of gauge data.
 * @throws {Error} - If any data retrieval fails.
 */
export async function generateGaugeSnapshot(user_id, chatroom_id) {
  try {
    // 1) Retrieve context and memory from state modules
    const context = await getContext(user_id, chatroom_id);
    const memory = await getMemory(user_id, chatroom_id);

    // 2) Retrieve heads (sub-personas) from heads_state
    const heads = await getHeads(user_id, chatroom_id);
    const headCount = heads.length;

    // 3) Retrieve active tasks from "task_cards"
    const { data: activeTasks, error } = await supabase
      .from("task_cards")
      .select(`
        id,
        subtasks (
          id, status
        )
      `)
      .eq("user_id", user_id)
      .eq("chatroom_id", chatroom_id)
      .filter("subtasks.status", "neq", "completed"); // Filter for active subtasks

    if (error) {
      throw new Error(`Error fetching tasks: ${error.message}`);
    }

    // 4) Consolidate gauge data
    return {
      priority: context.priority || "Normal",
      keywords: context.keywords || [],
      memoryUsage: memory.length,
      headCount,
      activeTasksCount: activeTasks.length,
    };
  } catch (error) {
    console.error("Error generating gauge snapshot:", error);
    throw new Error(`Failed to generate gauge snapshot: ${error.message}`);
  }
}
