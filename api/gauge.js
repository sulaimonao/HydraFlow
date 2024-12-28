// api/gauge.js

import { getContext } from "../../src/state/context_state.js";
import { getMemory } from "../../src/state/memory_state.js";
import { getHeads } from "../../src/state/heads_state.js";
import { db } from "../../lib/db.js"; // Your Supabase or DB interface
import { STATUS } from "../../src/util/constants.js";

/**
 * This route expects `userId` and `chatroomId` as query parameters:
 *    GET /api/gauge?userId=someUser&chatroomId=someChatroom
 * 
 * If those are optional in your setup, you can default them accordingly.
 */
export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const { userId, chatroomId } = req.query;

      // Fallback if none provided (you can remove these if userId/chatroomId must be required)
      const safeUserId = userId || "defaultUser";
      const safeChatroomId = chatroomId || "defaultChatroom";

      // 1) Retrieve context (priority, keywords, etc.)
      const context = await getContext(safeUserId, safeChatroomId);

      // 2) Retrieve memory (entire conversation or partial)
      const memory = await getMemory(safeUserId, safeChatroomId);

      // 3) Retrieve heads (sub-personas) 
      const heads = await getHeads(safeUserId, safeChatroomId);
      const headCount = heads.length;

      // 4) Retrieve all tasks from the DB (task_cards)
      //    Depending on your code, you might need an existing function or direct query.
      //    For example, if you have db.task_cards as a Mongo-like object:
      const allTasks = await db.task_cards.find({ userId: safeUserId, chatroomId: safeChatroomId }).toArray();

      // In your system, each "task" might have subtasks. Let's find any tasks that are incomplete:
      const activeTasks = allTasks.filter(task => {
        // If subtasks is an array, check if any subtask is not completed
        return task.subtasks && task.subtasks.some(st => st.status !== "completed");
      });

      // Environment or other system-wide constraints
      const environment = process.env.NODE_ENV || "development";

      // Compose gauge data
      const gaugeData = {
        status: STATUS.SUCCESS,
        environment,
        userId: safeUserId,
        chatroomId: safeChatroomId,
        contextSnapshot: {
          priority: context.priority || "Normal",
          keywords: context.keywords || [],
          // Add other context props if helpful
        },
        memoryUsage: memory ? memory.length : 0,
        headCount,
        activeTasksCount: activeTasks.length,
        // You can also return the raw tasks or heads if desired
        limitationNotes: [
          "Example: Max heads = 5",
          "Token limit = 1000 (example from conditions.js)",
          // Add or remove any constraints you want to show
        ],
      };

      return res.status(200).json(gaugeData);
    } catch (error) {
      console.error("Error in gauge route:", error);
      return res.status(500).json({ status: STATUS.ERROR, error: "Internal server error." });
    }
  } else {
    // Only allow GET requests
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
