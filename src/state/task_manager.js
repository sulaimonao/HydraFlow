// src/state/task_manager.js

import { db } from "../../lib/db.js";

let tasks = []; // In-memory task storage (fallback for testing or offline mode)

export const createTaskCard = async (goal, subtasks, user_id, chatroom_id) => {
  const taskCard = {
    id: `task_${Date.now()}`,
    goal,
    priority: "High",
    subtasks: subtasks.map((task, index) => ({
      id: `subtask_${Date.now()}_${index}`,
      task,
      status: "pending",
      dependencies: [],
    })),
    createdAt: new Date().toISOString(),
    user_id,
    chatroom_id,
  };

  // Store taskCard in the database
  tasks.push(taskCard); // Keep existing in-memory functionality
  await db.task_cards.insert(taskCard);

  return taskCard;
};

export const addDependency = async (taskId, dependencyId, user_id, chatroom_id) => {
  const task = await db.task_cards.findOne({ id: taskId, user_id, chatroom_id });
  if (!task) throw new Error(`Task ${taskId} not found`);

  task.subtasks.forEach((subtask) => {
    if (subtask.id === dependencyId) {
      subtask.dependencies.push(taskId);
    }
  });

  await db.task_cards.update(
    { id: taskId, user_id, chatroom_id },
    { $set: { subtasks: task.subtasks } }
  );
};

export const updateTaskStatus = async (taskId, status, user_id, chatroom_id) => {
  const task = await db.task_cards.findOne({ id: taskId, user_id, chatroom_id });
  if (!task) throw new Error(`Task ${taskId} not found`);

  task.subtasks.forEach((subtask) => {
    subtask.status = status;
  });

  await db.task_cards.update(
    { id: taskId, user_id, chatroom_id },
    { $set: { subtasks: task.subtasks } }
  );
};

export const getTaskCard = async (taskId, user_id, chatroom_id) => {
  return (
    (await db.task_cards.findOne({ id: taskId, user_id, chatroom_id })) ||
    tasks.find((t) => t.id === taskId) // Fallback for in-memory tasks
  );
};
