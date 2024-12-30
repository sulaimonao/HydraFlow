// api/task.js
import {
  insertTaskCard,
  insertSubtasks,
  fetchTaskCards,
  updateSubtaskStatus,
  markTaskCardInactive,
} from "../lib/db.js";

export default async function handler(req, res) {
  try {
    if (req.method === "POST") {
      const { goal, priority, subtasks } = req.body;
      if (!goal || !Array.isArray(subtasks)) {
        return res.status(400).json({ error: "Goal and subtasks are required." });
      }
      const taskCard = await insertTaskCard({ goal, priority });
      const createdSubtasks = await insertSubtasks({ taskCardId: taskCard.id, subtasks });
      return res.status(201).json({ taskCard, subtasks: createdSubtasks });
    } else if (req.method === "GET") {
      const tasks = await fetchTaskCards();
      return res.status(200).json({ tasks });
    } else if (req.method === "PUT") {
      const { subtaskId, status } = req.body;
      if (!subtaskId || !status) {
        return res.status(400).json({ error: "Subtask ID and status are required." });
      }
      const updatedSubtask = await updateSubtaskStatus({ subtaskId, status });
      return res.status(200).json({ subtask: updatedSubtask });
    } else if (req.method === "DELETE") {
      const { taskCardId } = req.body;
      if (!taskCardId) {
        return res.status(400).json({ error: "Task Card ID is required." });
      }
      const inactiveTask = await markTaskCardInactive({ taskCardId });
      return res.status(200).json({ task: inactiveTask });
    } else {
      res.setHeader("Allow", ["POST", "GET", "PUT", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error("Error in task API:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}
