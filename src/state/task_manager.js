// src/state/task_manager.js

import { insertTaskCard, updateTaskCard, fetchTaskCardsWithSubtasks, updateSubtasks } from "../util/db_helpers.js";

export const createTaskCard = async (goal, subtasks, user_id, chatroom_id) => {
  const taskCard = {
    goal,
    priority: "High",
    subtasks: subtasks.map((task, index) => ({
      description: task,
      status: "pending",
    })),
    createdAt: new Date().toISOString(),
    user_id,
    chatroom_id,
  };

  const insertedTaskCard = await insertTaskCard(taskCard);
  return insertedTaskCard;
};

export const updateTaskStatus = async (taskId, status, user_id, chatroom_id) => {
  const tasks = await fetchTaskCardsWithSubtasks(user_id, chatroom_id);
  const taskToUpdate = tasks.find((task) => task.id === taskId);
  if (!taskToUpdate) throw new Error(`Task with ID ${taskId} not found.`);

  const updatedSubtasks = taskToUpdate.subtasks.map((subtask) => ({
    ...subtask,
    status,
  }));

  await updateSubtasks(updatedSubtasks.map((sub) => sub.id), status);
  return taskToUpdate;
};
