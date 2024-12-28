// src/logic/gauge_logic.js

import { getContext } from "../state/context_state.js";
import { getMemory } from "../state/memory_state.js";
import { getHeads } from "../state/heads_state.js";
import { supabase } from "../../lib/db.js";

/**
 * Gathers an instrument cluster / gauge snapshot for the given user & chatroom:
 *  - context priority, keywords
 *  - memory usage
 *  - number of heads (sub-personas)
 *  - number of active tasks
 */
export async function gatherGaugeData({ user_id, chatroom_id }) {
  // 1) Retrieve context & memory from your state modules
  const c = await getContext(user_id, chatroom_id);
  const m = await getMemory(user_id, chatroom_id);

  // 2) Retrieve heads (sub-personas) from heads_state
  const heads = await getHeads(user_id, chatroom_id);
  const headCount = heads.length;

  // 3) Retrieve tasks from "task_cards"
  //    (assuming your table has columns user_id, chatroom_id)
  const { data: allTasks = [], error } = await supabase
    .from("task_cards")
    .select(`
      *,
      subtasks (
        *,
        task_dependencies (*)
      )
    `)
    .eq("user_id", user_id)
    .eq("chatroom_id", chatroom_id);

  if (error) {
    console.error("Error fetching tasks for gauge:", error);
  }

  // 4) Find active tasks (i.e., tasks that have at least one incomplete subtask)
  const activeTasks = allTasks.filter(
    (task) => 
      task.subtasks && 
      task.subtasks.some((st) => st.status !== "completed")
  );

  // 5) Return the consolidated gauge data
  return {
    // e.g., if context has a "priority" or "keywords" field
    priority: c.priority || "Normal",
    keywords: c.keywords || [],
    memoryUsage: m.length,
    headCount,
    activeTasksCount: activeTasks.length,
  };
}
