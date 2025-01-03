//src/state/task_manager.js
import {
  insertTaskCard,
  fetchTaskCardsWithSubtasks,
  updateSubtasksStatus,
  logDebugIssue,
  logInfo,
  logError,
} from "../util/database/db_helpers.js";

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
