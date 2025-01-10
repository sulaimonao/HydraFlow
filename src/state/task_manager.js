// src/state/task_manager.js
import supabase, { supabaseRequest } from '../../lib/supabaseClient.js';

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

export const getTaskCard = async (taskId) => {
  try {
    const { data, error } = await supabaseRequest(
      supabase.from('task_cards').select('*').eq('id', taskId)
    );

    if (error) {
      throw new Error(`Error fetching task card: ${error.message}`);
    }

    return data[0];
  } catch (error) {
    console.error('Error in getTaskCard:', error);
    throw error;
  }
};

/**
 * Adds a dependency between two tasks.
 * @param {string} taskId - The ID of the task that depends on another task.
 * @param {string} dependencyId - The ID of the task that is a dependency.
 * @returns {Promise<object>} - The result of the dependency addition.
 */
export async function addDependency(taskId, dependencyId) {
  try {
    const { data, error } = await supabase
      .from('task_dependencies')
      .insert([{ task_id: taskId, dependency_id: dependencyId }]);

    if (error) {
      throw new Error(`Error adding dependency: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Error in addDependency:", error);
    throw error;
  }
}

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
