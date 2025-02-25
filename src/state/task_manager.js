// src/state/task_manager.js (Local SQLite Version)
// Removed Supabase imports
//import { supabase, supabaseRequest } from '../lib/db.js';
import * as db from '../../lib/db.js'; // Import SQLite db module
// Removed setSessionContext import
//import { setSessionContext } from '../../lib/sessionUtils.js';
import { orchestrateContextWorkflow } from '../logic/workflow_manager.js';

/**
 * ✅ Creates a new task card with subtasks and stores it in the database.
 * @param {string} goal - Task goal/description.
 * @param {Array<string>} subtasks - List of subtasks.
 * @param {object} req - for userId and chatroomId
 */
export const createTaskCard = async (goal, subtasks, req) => { // Removed query
    try {
        // 🌐 Retrieve persistent user and chatroom IDs
        // Removed orchestrateContextWorkflow, use req.session
        //const { generatedIdentifiers } = await orchestrateContextWorkflow({ query, req });
        //const { user_id, chatroom_id } = generatedIdentifiers;
        const { userId, chatroomId } = req.session;

        // 🔒 No need to set session context
        // await setSessionContext(userId, chatroomId);

        // 📦 Prepare the task card (simplified - no subtasks here)
        const taskCard = {
            goal,
            priority: "High",
            user_id: userId, // Use userId directly
            chatroom_id: chatroomId, // Use chatroomId directly
            // Removed subtasks - will be handled separately
        };

        // 🚀 Insert the task card using db.insertTaskCard
        const result = await db.insertTaskCard(userId, chatroomId, goal, taskCard.priority);

        // Insert subtasks, if any
        if (subtasks && Array.isArray(subtasks)) {
          await db.insertSubtasks(userId, chatroomId, result.id, subtasks);
        }
        console.log(`✅ Task card created for user: ${userId}, chatroom: ${chatroomId}, id ${result.id}`);

        return { ...taskCard, id: result.id }; // Return task card with ID
    } catch (error) {
        console.error('❌ Error creating task card:', error);
        throw error; // Re-throw the error
    }
};

/**
 * ✅ Fetches a specific task card by ID.
 * @param {string} taskId - Task card ID.
 * @param {string} userId - user ID
 * @param {string} chatroomId- chatroom ID
 * @returns task card, or throws error
 */
export const getTaskCard = async (taskId, userId, chatroomId) => { //Removed req, query
    try {
        // Removed orchestrateContextWorkflow and setSessionContext
        // await setSessionContext(userId, chatroomId);

        // Use db.fetchTaskCardById (which you already have)
        const taskCard = await db.fetchTaskCardById(taskId, userId, chatroomId);

        if (!taskCard) {
            throw new Error(`Task card with ID ${taskId} not found for this user/context.`);
        }

        console.log(`📥 Task card fetched for user: ${userId}, task ID: ${taskId}`);
        return taskCard;
    } catch (error) {
        console.error('❌ Error in getTaskCard:', error);
        throw error; // Re-throw
    }
};

/**
 * ✅ Adds a dependency between two subtasks.
 * @param {Object} req - Request object for session tracking.
 * @param {string} childSubtaskId - The child subtask ID.
 * @param {string} parentSubtaskId - The parent subtask ID.
 */
export async function addDependency(req, childSubtaskId, parentSubtaskId) {
  try {
    const { userId, chatroomId } = req.session;

    // Use db.insertTaskDependency
    const result = await db.insertTaskDependency(userId, chatroomId, childSubtaskId, parentSubtaskId);

    console.log(`🔗 Dependency added: ${childSubtaskId} depends on ${parentSubtaskId}`);
    return { id: result.id }; // Return ID of new dependency
  } catch (error) {
    console.error("❌ Error in addDependency:", error);
    throw error; // Re-throw
  }
}

/**
 * ✅ Updates the status of a subtask.
 * @param {Object} req - Request object.
 * @param {string} subtaskId - Subtask ID.
 * @param {string} status - New status (pending, in_progress, completed).
 */
export const updateTaskStatus = async (req, subtaskId, status) => {
    try {
        const { userId, chatroomId } = req.session;
        // Removed setSessionContext
        // await setSessionContext(userId, chatroomId);

        // Use db.updateSubtaskStatus
        await db.updateSubtaskStatus(userId, chatroomId, subtaskId, status);

        console.log(`🔄 Task status updated: Task ID ${subtaskId} → ${status}`);
    } catch (error) {
        console.error('❌ Error updating task status:', error);
        throw error; // Re-throw
    }
};

/**
 * ✅ Limits responses to avoid overload. (Keep this - it's generic)
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
 * ✅ Prioritizes tasks based on status and priority. (Keep this - it's generic)
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
 * ✅ Simplifies response objects for cleaner output. (Keep this - it's generic)
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

export { };