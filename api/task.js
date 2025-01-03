// api/task.js
import {
  insertTaskCard,
  insertSubtasks,
  fetchTaskCardsWithSubtasks,
  updateSubtasks,
  markTaskCardInactive,
  logInfo,
  logError,
} from "../util/index.js";

export default async function handler(req, res) {
  try {
    const { method } = req;

    if (method === "POST") {
      const { goal, priority = "Normal", subtasks, user_id, chatroom_id } = req.body;
      if (!goal || !Array.isArray(subtasks) || !user_id || !chatroom_id) {
        return res.status(400).json({ error: "Goal, subtasks, user_id, and chatroom_id are required." });
      }

      const taskCard = await insertTaskCard({ goal, priority, user_id, chatroom_id });
      await insertSubtasks(taskCard.id, subtasks);

      logInfo(`Task card created with ID: ${taskCard.id}`);
      return res.status(201).json({ message: "Task card created successfully.", taskCard });
    }

    if (method === "GET") {
      const { user_id, chatroom_id } = req.query;
      if (!user_id || !chatroom_id) {
        return res.status(400).json({ error: "user_id and chatroom_id are required." });
      }

      const tasks = await fetchTaskCardsWithSubtasks(user_id, chatroom_id);

      logInfo(`Fetched ${tasks.length} task cards for user ${user_id} in chatroom ${chatroom_id}`);
      return res.status(200).json({ tasks });
    }

    if (method === "PUT") {
      const { subtaskId, status } = req.body;
      if (!subtaskId || !status) {
        return res.status(400).json({ error: "Subtask ID and status are required." });
      }

      await updateSubtasks([subtaskId], status);

      logInfo(`Updated subtask ${subtaskId} with status: ${status}`);
      return res.status(200).json({ message: "Subtask updated successfully." });
    }

    if (method === "DELETE") {
      const { taskCardId } = req.body;
      if (!taskCardId) {
        return res.status(400).json({ error: "Task Card ID is required." });
      }

      await markTaskCardInactive(taskCardId);

      logInfo(`Task card ${taskCardId} marked as inactive.`);
      return res.status(200).json({ message: "Task card marked as inactive." });
    }

    res.setHeader("Allow", ["POST", "GET", "PUT", "DELETE"]);
    return res.status(405).json({ error: `Method ${method} Not Allowed` });
  } catch (error) {
    logError(`Error in task API: ${error.message}`);
    res.status(500).json({ error: "Internal server error. Please try again." });
  }
}
