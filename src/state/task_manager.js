// src/state/task_manager.js

const tasks = []; // In-memory task storage (replace with DB if needed)

export const createTaskCard = (goal, subtasks) => {
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
  };

  tasks.push(taskCard);
  return taskCard;
};

export const addDependency = (taskId, dependencyId) => {
  const task = tasks.find((t) => t.id === taskId);
  if (!task) throw new Error(`Task ${taskId} not found`);

  task.subtasks.forEach((subtask) => {
    if (subtask.id === dependencyId) {
      subtask.dependencies.push(taskId);
    }
  });
};

export const updateTaskStatus = (taskId, status) => {
  const task = tasks.find((t) => t.id === taskId);
  if (!task) throw new Error(`Task ${taskId} not found`);

  task.subtasks.forEach((subtask) => {
    subtask.status = status;
  });
};

export const getTaskCard = (taskId) => tasks.find((t) => t.id === taskId);
