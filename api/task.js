// api/task.js
import {
  insertTaskCard,
  insertSubtasks,
  fetchTaskCardsWithSubtasks,
  updateSubtasks,
  markTaskCardInactive,
} from "../util/db_helpers.js";
import { logInfo, logError } from "../src/util/logger.js";

export default async function handler(req, res) {
  try {
    if (req.method === "POST") {
      // Validate request body
      const { goal, priority = "Normal", subtasks, user_id, chatroom_id } = req.body;
      if (!goal || !Array.isArray(subtasks) || !user_id || !chatroom_id) {
        return res.status(400).json({ error: "Goal, subtasks, user_id, and chatroom_id are required." });
      }

      // Insert task card and subtasks
      const taskCard = await insertTaskCard({ goal, priority, user_id, chatroom_id });
      await insertSubtasks(taskCard.id, subtasks);

      logInfo(`Task card created with ID: ${taskCard.id}`);
      return res.status(201).json({ message: "Task card created successfully.", taskCard });
    } else if (req.method === "GET") {
      // Validate query parameters
      const { user_id, chatroom_id } = req.query;
      if (!user_id || !chatroom_id) {
        return res.status(400).json({ error: "user_id and chatroom_id are required." });
      }

      // Fetch task cards and subtasks
      const tasks = await fetchTaskCardsWithSubtasks(user_id, chatroom_id);

      logInfo(`Fetched ${tasks.length} task cards for user ${user_id} in chatroom ${chatroom_id}`);
      return res.status(200).json({ tasks });
    } else if (req.method === "PUT") {
      // Validate request body
      const { subtaskId, status } = req.body;
      if (!subtaskId || !status) {
        return res.status(400).json({ error: "Subtask ID and status are required." });
      }

      // Update subtask status
      await updateSubtasks([subtaskId], status);

      logInfo(`Updated subtask ${subtaskId} with status: ${status}`);
      return res.status(200).json({ message: "Subtask updated successfully." });
    } else if (req.method === "DELETE") {
      // Validate request body
      const { taskCardId } = req.body;
      if (!taskCardId) {
        return res.status(400).json({ error: "Task Card ID is required." });
      }

      // Mark task card as inactive
      await markTaskCardInactive(taskCardId);

      logInfo(`Task card ${taskCardId} marked as inactive.`);
      return res.status(200).json({ message: "Task card marked as inactive." });
    } else {
      res.setHeader("Allow", ["POST", "GET", "PUT", "DELETE"]);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    logError(`Error in task API: ${error.message}`);
    res.status(500).json({ error: "Internal server error. Please try again." });
  }
}
