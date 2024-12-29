// api/gauge.js

import { supabase } from "../lib/db.js";
import { getContext } from "../src/state/context_state.js";
import { getMemory } from "../src/state/memory_state.js";
import { getHeads } from "../src/state/heads_state.js";
import { STATUS } from "../src/util/constants.js";

/**
 * GET /api/gauge?user_id=alice123&chatroom_id=general
 * 
 * Summarizes HydraFlow internal state for a given user and chatroom.
 */
export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      // 1) Parse query params for user/chat
      const { user_id, chatroom_id } = req.query;

      // Fallback if none provided
      const safeUserId = user_id || "defaultUser";
      const safeChatroomId = chatroom_id || "defaultChatroom";

      // 2) Retrieve context
      const context = await getContext(safeUserId, safeChatroomId);
      // 3) Retrieve memory
      const memory = await getMemory(safeUserId, safeChatroomId);
      // 4) Retrieve heads
      const heads = await getHeads(safeUserId, safeChatroomId);
      const headCount = heads.length;

      // 5) Retrieve tasks from supabase "task_cards" table
      const { data: allTasks, error: taskError } = await supabase
        .from("task_cards")
        .select(`
          *,
          subtasks (
            *,
            task_dependencies!task_dependencies_depends_on_fkey (*),
            task_dependencies!task_dependencies_subtask_id_fkey (*)
          )
        `)
        .eq("user_id", safeUserId)
        .eq("chatroom_id", safeChatroomId);

      if (taskError) {
        console.error("Error fetching task cards from Supabase:", taskError);
      }

      // If no tasks, default to empty array
      const tasksArray = allTasks || [];

      // 6) Figure out how many tasks are "active"
      const activeTasks = tasksArray.filter((task) => {
        return (
          task.subtasks &&
          task.subtasks.some((st) => st.status !== "completed")
        );
      });

      // 7) Compose final gauge data
      const environment = process.env.NODE_ENV || "development";
      const gaugeData = {
        status: STATUS.SUCCESS,
        environment,
        user_id: safeUserId,
        chatroom_id: safeChatroomId,
        contextSnapshot: {
          priority: context.priority || "Normal",
          keywords: context.keywords || [],
        },
        memoryUsage: memory ? memory.length : 0,
        headCount,
        activeTasksCount: activeTasks.length,
        limitationNotes: [
          "Example: Max heads = 5",
          "Token limit = 1000 (conditions.js)", 
        ],
      };

      // 8) Return the gauge data
      return res.status(200).json(gaugeData);
    } catch (error) {
      console.error("Error in gauge route:", error);
      return res
        .status(500)
        .json({ status: STATUS.ERROR, error: "Internal server error." });
    }
  } else {
    // Only allow GET
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
