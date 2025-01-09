// src/state/task_manager.js
import supabase, { supabaseRequest } from '../../lib/supabaseClient';

export const createTaskCard = async (goal, subtasks) => {
  const taskCard = {
    goal,
    priority: "High",
    subtasks: subtasks.map((task) => ({
      description: task,
      status: "pending",
      dependencies: [],
    })),
    createdAt: new Date().toISOString(),
  };

  try {
    const data = await supabaseRequest(
      supabase.from('task_cards').insert([taskCard])
    );
    return data[0];
  } catch (error) {
    console.error('Error creating task card:', error);
    throw error;
  }
};

export const addDependency = async (taskId, dependencyId) => {
  try {
    const task = await getTaskCard(taskId);
    if (!task) throw new Error(`Task ${taskId} not found.`);

    const existingDependencies = task.subtasks.find((sub) => sub.id === taskId)?.dependencies || [];
    if (existingDependencies.includes(dependencyId)) {
      throw new Error(`Dependency ${dependencyId} already exists for task ${taskId}.`);
    }

    existingDependencies.push(dependencyId);
    await supabaseRequest(
      supabase.from('subtasks').update({ dependencies: existingDependencies }).eq('id', taskId)
    );
    return { taskId, dependencies: existingDependencies };
  } catch (error) {
    console.error('Error adding dependency:', error);
    throw error;
  }
};

export const updateTaskStatus = async (taskId, status) => {
  try {
    await supabaseRequest(
      supabase.from('subtasks').update({ status }).eq('id', taskId)
    );
  } catch (error) {
    console.error('Error updating task status:', error);
    throw error;
  }
};
