// api/task.js
import {
  insertTaskCard,
  insertSubtasks,
  fetchTaskCardsWithSubtasks,
  updateSubtasks,
  markTaskCardInactive,
} from "../util/db_helpers.js";

export default async function handler(req, res) {
  try {
    if (req.method === "POST") {
      const { goal, priority, subtasks, user_id, chatroom_id } = req.body;
      if (!goal || !Array.isArray(subtasks)) {
        return res.status(400).json({ error: "Goal and subtasks are required." });
      }
      const taskCard = await insertTaskCard({ goal, priority, subtasks, user_id, chatroom_id });
      return res.status(201).json({ taskCard });
    } else if (req.method === "GET") {
      const { user_id, chatroom_id } = req.query;
      const tasks = await fetchTaskCardsWithSubtasks(user_id, chatroom_id);
      return res.status(200).json({ tasks });
    } else if (req.method === "PUT") {
      const { subtaskId, status } = req.body;
      if (!subtaskId || !status) {
        return res.status(400).json({ error: "Subtask ID and status are required." });
      }
      await updateSubtasks([subtaskId], status);
      return res.status(200).json({ message: "Subtask updated successfully." });
    } else if (req.method === "DELETE") {
      const { taskCardId } = req.body;
      if (!taskCardId) {
        return res.status(400).json({ error: "Task Card ID is required." });
      }
      await markTaskCardInactive(taskCardId);
      return res.status(200).json({ message: "Task marked as inactive." });
    } else {
      res.setHeader("Allow", ["POST", "GET", "PUT", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error("Error in task API:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}
