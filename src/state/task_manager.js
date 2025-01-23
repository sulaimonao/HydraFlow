// src/state/task_manager.js
import supabase, { supabaseRequest } from '../../lib/supabaseClient.js';
import { setSessionContext } from '../../lib/sessionUtils.js';
import { orchestrateContextWorkflow } from '../logic/workflow_manager.js';

/**
 * ✅ Creates a new task card with subtasks and stores it in the database.
 * @param {Object} req - Request object for session tracking.
 * @param {string} query - User query.
 * @param {string} goal - Task goal/description.
 * @param {Array<string>} subtasks - List of subtasks.
 */
export const createTaskCard = async (req, query, goal, subtasks) => {
  try {
    // 🌐 Retrieve persistent user and chatroom IDs
    const { generatedIdentifiers } = await orchestrateContextWorkflow({ query, req });
    const { user_id, chatroom_id } = generatedIdentifiers;

    // 🔒 Set session context for RLS enforcement
    await setSessionContext(user_id, chatroom_id);

    // 📦 Prepare the task card
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

    // 🚀 Insert the task card using upsert to avoid duplication
    const { data, error } = await supabaseRequest(
      supabase.from('task_cards').upsert([taskCard], { onConflict: ['user_id', 'chatroom_id', 'goal'] })
    );

    if (error) throw new Error(`Error creating task card: ${error.message}`);
    
    console.log(`✅ Task card created for user: ${user_id}, chatroom: ${chatroom_id}`);
    return data[0];
  } catch (error) {
    console.error('❌ Error creating task card:', error);
    throw error;
  }
};

/**
 * ✅ Fetches a specific task card by ID.
 * @param {Object} req - Request object for session tracking.
 * @param {string} query - User query.
 * @param {string} taskId - Task card ID.
 */
export const getTaskCard = async (req, query, taskId) => {
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
    console.log(`📥 Task card fetched for user: ${user_id}, task ID: ${taskId}`);
    return data[0];
  } catch (error) {
    console.error('❌ Error in getTaskCard:', error);
    throw error;
  }
};

/**
 * ✅ Adds a dependency between two tasks.
 * @param {Object} req - Request object for session tracking.
 * @param {string} query - User query.
 * @param {string} taskId - The main task ID.
 * @param {string} dependencyId - The dependent task ID.
 */
export async function addDependency(req, query, taskId, dependencyId) {
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
    console.log(`🔗 Dependency added: ${taskId} depends on ${dependencyId}`);
    return data;
  } catch (error) {
    console.error("❌ Error in addDependency:", error);
    throw error;
  }
}

/**
 * ✅ Updates the status of a subtask.
 * @param {Object} req - Request object for session tracking.
 * @param {string} query - User query.
 * @param {string} taskId - Subtask ID.
 * @param {string} status - New status (pending, in_progress, completed).
 */
export const updateTaskStatus = async (req, query, taskId, status) => {
  try {
    // const { generatedIdentifiers } = await orchestrateContextWorkflow({ query, req });
    const user_id = req.session.userId;
    const chatroom_id = req.session.chatroomId;
    await setSessionContext(user_id, chatroom_id);

    await supabaseRequest(() =>
      supabase
        .from('subtasks')
        .update({ status })
        .eq('id', taskId)
        .eq('user_id', user_id)
        .eq('chatroom_id', chatroom_id)
    );

    console.log(`🔄 Task status updated: Task ID ${taskId} → ${status}`);
  } catch (error) {
    console.error('❌ Error updating task status:', error);
    throw error;
  }
};

/**
 * ✅ Limits responses to avoid overload.
 * @param {Array} responses - Array of response objects.
 * @param {number} maxLimit - Maximum number of responses to return.
 */
export const limitResponses = (responses, maxLimit = 5) => {
  if (!Array.isArray(responses)) {
    console.warn("⚠️ Invalid input: responses should be an array.");
    return [];
  }
  return responses.slice(0, maxLimit);
};

/**
 * ✅ Prioritizes tasks based on status and priority.
 * @param {Array} tasks - Array of task objects.
 */
export const prioritizeTasks = (tasks) => {
  if (!Array.isArray(tasks)) {
    console.warn("⚠️ Invalid input: tasks should be an array.");
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
 * ✅ Simplifies response objects for cleaner output.
 * @param {Array} responses - Array of responses.
 */
export const simplifyResponses = (responses) => {
  if (!Array.isArray(responses)) {
    console.warn("⚠️ Invalid input: responses should be an array.");
    return [];
  }

  return responses.map(response => ({
    id: response.id,
    status: response.status,
    message: response.message || "No message provided",
  }));
};
