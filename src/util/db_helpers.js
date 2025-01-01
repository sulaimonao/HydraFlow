// src/util/db_helpers.js
import { supabase } from "../../lib/db.js";
import { logError } from "./logger.js";

/**
 * Updates the status of multiple subtasks in bulk.
 *
 * @param {Array<number>} subtaskIds - An array of subtask IDs to update.
 * @param {string} status - The new status to set (e.g., 'completed').
 * @throws {Error} - If updating subtasks fails.
 */
export async function updateSubtasksStatus(subtaskIds, status) {
  try {
    const { error } = await supabase
      .from("subtasks")
      .update({ status })
      .in("id", subtaskIds);

    if (error) throw error;
  } catch (error) {
    logError(`Error updating subtasks: ${error.message}`, { subtaskIds });
    throw new Error(`Error updating subtasks: ${error.message}`);
  }
}

/**
 * Inserts a new task card into the database.
 *
 * @param {Object} taskCard - The task card details to insert.
 * @returns {Object} - The inserted task card object.
 * @throws {Error} - If the insertion fails.
 */
export async function insertTaskCard(taskCard) {
  try {
    const { data, error } = await supabase
      .from("task_cards")
      .insert(taskCard)
      .select()
      .single();

    if (error) throw new Error(`Error inserting task card: ${error.message}`);
    return data;
  } catch (error) {
    logError(`Error in insertTaskCard: ${error.message}`, { taskCard });
    throw error;
  }
}

/**
 * Fetches all task cards with subtasks for a specific user and chatroom.
 *
 * @param {string} userId - The user ID.
 * @param {string} chatroomId - The chatroom ID.
 * @returns {Array} - An array of task cards with their subtasks.
 * @throws {Error} - If fetching task cards fails.
 */
export async function fetchTaskCardsWithSubtasks(userId, chatroomId) {
  try {
    const { data, error } = await supabase
      .from("task_cards")
      .select(`
        id, goal, priority, active, created_at,
        subtasks (
          id, description, status, created_at
        )
      `)
      .eq("user_id", userId)
      .eq("chatroom_id", chatroomId);

    if (error) throw error;
    return data;
  } catch (error) {
    logError(`Error fetching task cards: ${error.message}`, { userId, chatroomId });
    throw new Error(`Error fetching task cards: ${error.message}`);
  }
}

/**
 * Fetches all tasks with subtasks and dependencies for a specific user and chatroom.
 *
 * @param {string} userId - The user ID.
 * @param {string} chatroomId - The chatroom ID.
 * @returns {Array} - Array of task cards with subtasks and dependencies.
 * @throws {Error} - If fetching task cards fails.
 */
export async function fetchAllTasksWithDetails(userId, chatroomId) {
  try {
    const { data, error } = await supabase
      .from("task_cards")
      .select(`
        id, goal, priority, active, created_at,
        subtasks (
          id, description, status, created_at,
          task_dependencies (*)
        )
      `)
      .eq("user_id", userId)
      .eq("chatroom_id", chatroomId);

    if (error) throw error;
    return data;
  } catch (error) {
    logError(`Error fetching detailed tasks: ${error.message}`, { userId, chatroomId });
    throw new Error(`Error fetching detailed tasks: ${error.message}`);
  }
}

/**
 * Fetches the gauge data for a specific user and chatroom.
 *
 * @param {Object} params - Parameters for fetching gauge data.
 * @param {string} params.userId - The user ID.
 * @param {string} params.chatroomId - The chatroom ID.
 * @returns {Object} - The gauge data object.
 * @throws {Error} - If fetching gauge data fails.
 */
export async function fetchGaugeData({ userId, chatroomId }) {
  try {
    const { data, error } = await supabase
      .from("gauge_data")
      .select("contextSnapshot, memoryUsage, headCount, activeTasksCount, limitationNotes")
      .eq("user_id", userId)
      .eq("chatroom_id", chatroomId)
      .single();

    if (error) throw error;

    return {
      ...data.contextSnapshot,
      memoryUsage: data.memoryUsage,
      headCount: data.headCount,
      activeTasksCount: data.activeTasksCount,
      limitationNotes: data.limitationNotes || [],
    };
  } catch (error) {
    logError(`Error fetching gauge data: ${error.message}`, { userId, chatroomId });
    throw new Error(`Error fetching gauge data: ${error.message}`);
  }
}

/**
 * Fetches the memory for a specific user and chatroom.
 *
 * @param {string} userId - The user ID.
 * @param {string} chatroomId - The chatroom ID.
 * @returns {string} - The concatenated memory string.
 * @throws {Error} - If fetching memory fails.
 */
export async function fetchMemory(userId, chatroomId) {
  try {
    const { data, error } = await supabase
      .from("memories")
      .select("memory")
      .eq("user_id", userId)
      .eq("chatroom_id", chatroomId);

    if (error) throw error;
    return data.map((row) => row.memory).join(" ");
  } catch (error) {
    logError(`Error fetching memory: ${error.message}`, { userId, chatroomId });
    throw new Error(`Error fetching memory: ${error.message}`);
  }
}

/**
 * Inserts or updates memory for a specific user and chatroom.
 *
 * @param {string} userId - The user ID.
 * @param {string} chatroomId - The chatroom ID.
 * @param {string} memory - The memory content to upsert.
 * @throws {Error} - If upserting memory fails.
 */
export async function upsertMemory(userId, chatroomId, memory) {
  try {
    const { error } = await supabase
      .from("memories")
      .upsert({
        user_id: userId,
        chatroom_id: chatroomId,
        memory,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
  } catch (error) {
    logError(`Error updating memory: ${error.message}`, { userId, chatroomId });
    throw new Error(`Error updating memory: ${error.message}`);
  }
}

/**
 * Fetches all templates from the database.
 *
 * @returns {Array} - An array of template objects.
 * @throws {Error} - If fetching templates fails.
 */
export async function fetchAllTemplates() {
  try {
    const { data, error } = await supabase
      .from("templates")
      .select("id, name, configuration, created_at");

    if (error) throw error;
    return data;
  } catch (error) {
    logError(`Error fetching templates: ${error.message}`);
    throw new Error(`Error fetching templates: ${error.message}`);
  }
}

/**
 * Inserts or updates a feedback entry in the database.
 *
 * @param {string} responseId - The ID of the response.
 * @param {string} userFeedback - The user's feedback.
 * @param {number} rating - The rating provided by the user.
 * @throws {Error} - If inserting/updating the feedback entry fails.
 */
export async function upsertFeedbackEntry(responseId, userFeedback, rating) {
  try {
    const { error } = await supabase
      .from("feedback_entries")
      .upsert({
        response_id: responseId,
        user_feedback: userFeedback,
        rating,
        timestamp: new Date().toISOString(),
      });

    if (error) throw error;
  } catch (error) {
    logError(`Error inserting/updating feedback entry: ${error.message}`, { responseId });
    throw new Error(`Error inserting/updating feedback entry: ${error.message}`);
  }
}

/**
 * Adds a new head (sub-persona) to the database.
 *
 * @param {string} task - The task or role of the head.
 * @param {string} description - A description of the head's purpose.
 * @param {string} userId - The user ID.
 * @param {string} chatroomId - The chatroom ID.
 * @returns {Object} - The newly added head object.
 * @throws {Error} - If the insertion fails.
 */
export async function addHead(task, description, userId, chatroomId) {
  try {
    const { data, error } = await supabase
      .from("heads")
      .insert({
        task,
        description,
        user_id: userId,
        chatroom_id: chatroomId,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(`Error adding head: ${error.message}`);
    return data;
  } catch (error) {
    logError(`Error in addHead: ${error.message}`, { task, userId, chatroomId });
    throw error;
  }
}

export {
  insertTaskCard,
  fetchTaskCardsWithSubtasks,
  updateSubtasksStatus,
  fetchAllTasksWithDetails,
  fetchGaugeData,
  fetchMemory,
  upsertMemory,
  fetchAllTemplates,
  upsertFeedbackEntry,
  addHead, // Newly added function
};
