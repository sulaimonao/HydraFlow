// api/task.js
import Joi from "joi";
import {
  insertTaskCard,
  insertSubtasks,
  fetchTaskCardsWithSubtasks,
  updateSubtasks,
  markTaskCardInactive,
  logInfo,
  logError,
} from "../src/util/index.js";

// Validation schema for POST requests
const taskSchema = Joi.object({
  goal: Joi.string().required(),
  priority: Joi.string().valid("Normal", "High").default("Normal"),
  subtasks: Joi.array().items(Joi.string()).required(),
  user_id: Joi.string().required(),
  chatroom_id: Joi.string().required(),
});

// Validation schema for PUT requests
const updateSchema = Joi.object({
  subtaskId: Joi.string().required(),
  status: Joi.string().valid("completed", "pending").required(),
});

export default async function handler(req, res) {
  try {
    const { method } = req;

    if (method === "POST") {
      const { error, value } = taskSchema.validate(req.body);
      if (error) {
        logError("Validation failed for task creation:", error.details);
        return res.status(400).json({ error: error.message });
      }

      const { goal, priority, subtasks, user_id, chatroom_id } = value;
      const taskCard = await insertTaskCard({ goal, priority, user_id, chatroom_id });
      await insertSubtasks(taskCard.id, subtasks);

      logInfo(`Task card created with ID: ${taskCard.id}`);
      return res.status(201).json({ message: "Task card created successfully.", taskCard });
    }

    if (method === "GET") {
      const { user_id, chatroom_id } = req.query;

      if (!user_id || !chatroom_id) {
        logError("Invalid request: Missing user_id or chatroom_id.");
        return res.status(400).json({ error: "user_id and chatroom_id are required." });
      }

      const tasks = await fetchTaskCardsWithSubtasks(user_id, chatroom_id);
      logInfo(`Fetched ${tasks.length} task cards for user ${user_id} in chatroom ${chatroom_id}.`);
      return res.status(200).json({ tasks });
    }

    if (method === "PUT") {
      const { error, value } = updateSchema.validate(req.body);
      if (error) {
        logError("Validation failed for subtask update:", error.details);
        return res.status(400).json({ error: error.message });
      }

      const { subtaskId, status } = value;
      await updateSubtasks([subtaskId], status);

      logInfo(`Updated subtask ${subtaskId} with status: ${status}`);
      return res.status(200).json({ message: "Subtask updated successfully." });
    }

    if (method === "DELETE") {
      const { taskCardId } = req.body;

      if (!taskCardId) {
        logError("Invalid request: Missing taskCardId.");
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
