// src/state/task_manager.js

import { db } from "../../lib/db.js";

let tasks = []; // In-memory task storage (fallback for testing or offline mode)

export const createTaskCard = async (goal, subtasks, userId, chatroomId) => {
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
    userId,
    chatroomId,
  };

  // Store taskCard in the database
  tasks.push(taskCard); // Keep existing in-memory functionality
  await db.task_cards.insert(taskCard);

  return taskCard;
};

export const addDependency = async (taskId, dependencyId, userId, chatroomId) => {
  const task = await db.task_cards.findOne({ id: taskId, userId, chatroomId });
  if (!task) throw new Error(`Task ${taskId} not found`);

  task.subtasks.forEach((subtask) => {
    if (subtask.id === dependencyId) {
      subtask.dependencies.push(taskId);
    }
  });

  await db.task_cards.update(
    { id: taskId, userId, chatroomId },
    { $set: { subtasks: task.subtasks } }
  );
};

export const updateTaskStatus = async (taskId, status, userId, chatroomId) => {
  const task = await db.task_cards.findOne({ id: taskId, userId, chatroomId });
  if (!task) throw new Error(`Task ${taskId} not found`);

  task.subtasks.forEach((subtask) => {
    subtask.status = status;
  });

  await db.task_cards.update(
    { id: taskId, userId, chatroomId },
    { $set: { subtasks: task.subtasks } }
  );
};

export const getTaskCard = async (taskId, userId, chatroomId) => {
  return (
    (await db.task_cards.findOne({ id: taskId, userId, chatroomId })) ||
    tasks.find((t) => t.id === taskId) // Fallback for in-memory tasks
  );
};
