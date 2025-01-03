import { insertTaskCard, fetchTaskCardsWithSubtasks, updateSubtasksStatus, logDebugIssue, logInfo, logError } from "../util/task.js";

/**
 * Creates a new task card and subtasks for a user in a chatroom.
 *
 * @param {string} goal - The task's goal or main description.
 * @param {Array<string>} subtasks - An array of subtask descriptions.
 * @param {string} user_id - The user ID.
 * @param {string} chatroom_id - The chatroom ID.
 * @returns {Object} - The inserted task card with metadata.
 */
export const createTaskCard = async (goal, subtasks, user_id, chatroom_id) => {
  try {
    const taskCard = {
      goal,
      priority: "High",
      subtasks: subtasks.map((task) => ({
        description: task,
        status: "pending",
      })),
      createdAt: new Date().toISOString(),
      user_id,
      chatroom_id,
    };

    const insertedTaskCard = await insertTaskCard(taskCard);
    logInfo("Task card created successfully.", { taskCardId: insertedTaskCard.id });
    return insertedTaskCard;
  } catch (error) {
    logError(`Failed to create task card: ${error.message}`);
    await logDebugIssue(user_id, null, "Task Creation Failure", error.message);
    throw error;
  }
};

/**
 * Updates the status of a specific task (and its subtasks) for a user in a chatroom.
 *
 * @param {number} taskId - The ID of the task to update.
 * @param {string} status - The new status (e.g., 'completed', 'pending').
 * @param {string} user_id - The user ID.
 * @param {string} chatroom_id - The chatroom ID.
 * @returns {Object} - The updated task object.
 */
export const updateTaskStatus = async (taskId, status, user_id, chatroom_id) => {
  try {
    const tasks = await fetchTaskCardsWithSubtasks(user_id, chatroom_id);
    const taskToUpdate = tasks.find((task) => task.id === taskId);
    if (!taskToUpdate) {
      throw new Error(`Task with ID ${taskId} not found for user ${user_id} in chatroom ${chatroom_id}.`);
    }

    const updatedSubtasks = taskToUpdate.subtasks.map((subtask) => ({
      ...subtask,
      status,
    }));

    await updateSubtasksStatus(updatedSubtasks.map((sub) => sub.id), status);
    logInfo(`Task (ID: ${taskId}) status updated to "${status}".`);

    return { ...taskToUpdate, subtasks: updatedSubtasks };
  } catch (error) {
    logError(`Failed to update task status: ${error.message}`);
    await logDebugIssue(user_id, null, "Task Update Failure", error.message);
    throw error;
  }
};
