// src/state/task_manager.js
import supabase, { supabaseRequest, setSessionContext } from '../../lib/supabaseClient.js';
import { orchestrateContextWorkflow } from '../logic/workflow_manager.js';

/**
 * Creates a new task card with subtasks.
 */
export const createTaskCard = async (query, goal, subtasks) => {
  try {
    // Retrieve consistent user_id and chatroom_id
    const { generatedIdentifiers } = await orchestrateContextWorkflow({ query, req });
    const { user_id, chatroom_id } = generatedIdentifiers;

    // Set session context for Supabase RLS enforcement
    await setSessionContext(user_id, chatroom_id);

    const taskCard = {
      goal,
      priority: "High",
      user_id,
      chatroom_id,
      subtasks: subtasks.map((task) => ({
        description: task,
        status: "pending",
        dependencies: [],
      })),
      createdAt: new Date().toISOString(),
    };

    const { data, error } = await supabaseRequest(
      supabase.from('task_cards').insert([taskCard])
    );

    if (error) throw new Error(`Error creating task card: ${error.message}`);
    return data[0];
  } catch (error) {
    console.error('Error creating task card:', error);
    throw error;
  }
};

/**
 * Fetches a specific task card.
 */
export const getTaskCard = async (query, taskId) => {
  try {
    const { generatedIdentifiers } = await orchestrateContextWorkflow({ query, req });
    const { user_id, chatroom_id } = generatedIdentifiers;

    await setSessionContext(user_id, chatroom_id);

    const { data, error } = await supabaseRequest(() =>
      supabase.from('task_cards')
        .select('*')
        .eq('id', taskId)
        .eq('user_id', user_id)
        .eq('chatroom_id', chatroom_id)
    );

    if (error) throw new Error(`Error fetching task card: ${error.message}`);
    return data[0];
  } catch (error) {
    console.error('Error in getTaskCard:', error);
    throw error;
  }
};

/**
 * Adds a dependency between two tasks.
 */
export async function addDependency(query, taskId, dependencyId) {
  try {
    const { generatedIdentifiers } = await orchestrateContextWorkflow({ query, req });
    const { user_id, chatroom_id } = generatedIdentifiers;

    await setSessionContext(user_id, chatroom_id);

    const { data, error } = await supabaseRequest(() =>
      supabase.from('task_dependencies').insert([{
        task_id: taskId,
        dependency_id: dependencyId,
        user_id,
        chatroom_id
      }])
    );

    if (error) throw new Error(`Error adding dependency: ${error.message}`);
    return data;
  } catch (error) {
    console.error("Error in addDependency:", error);
    throw error;
  }
}

/**
 * Updates the status of a subtask.
 */
export const updateTaskStatus = async (query, taskId, status) => {
  try {
    const { generatedIdentifiers } = await orchestrateContextWorkflow({ query, req });
    const { user_id, chatroom_id } = generatedIdentifiers;

    await setSessionContext(user_id, chatroom_id);

    await supabaseRequest(() =>
      supabase
        .from('subtasks')
        .update({ status })
        .eq('id', taskId)
        .eq('user_id', user_id)
        .eq('chatroom_id', chatroom_id)
    );
  } catch (error) {
    console.error('Error updating task status:', error);
    throw error;
  }
};

/**
 * Limits the number of responses to avoid overflow.
 */
export const limitResponses = (responses, maxLimit = 5) => {
  if (!Array.isArray(responses)) {
    console.warn("Invalid input: responses should be an array.");
    return [];
  }
  return responses.slice(0, maxLimit);
};

/**
 * Prioritizes tasks based on their status and priority.
 */
export const prioritizeTasks = (tasks) => {
  if (!Array.isArray(tasks)) {
    console.warn("Invalid input: tasks should be an array.");
    return [];
  }

  return tasks.sort((a, b) => {
    const priorityOrder = { High: 3, Medium: 2, Low: 1 };
    const statusOrder = { pending: 3, in_progress: 2, completed: 1 };

    return (
      statusOrder[b.status] - statusOrder[a.status] ||
      priorityOrder[b.priority] - priorityOrder[a.priority]
    );
  });
};

/**
 * Simplifies response objects by removing unnecessary properties.
 */
export const simplifyResponses = (responses) => {
  if (!Array.isArray(responses)) {
    console.warn("Invalid input: responses should be an array.");
    return [];
  }

  return responses.map(response => ({
    id: response.id,
    status: response.status,
    message: response.message || "No message provided",
  }));
};
