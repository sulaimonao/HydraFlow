// src/util/db_helpers.js
import { supabase } from "../../lib/db.js";
import { logError } from "./index.js";

/**
 * Updates the status of multiple subtasks in bulk.
 *
 * @param {Array<number>} subtaskIds - An array of subtask IDs to update.
 * @param {string} status - The new status to set (e.g., 'completed').
 * @throws {Error} - If updating subtasks fails.
 */
async function updateSubtasksStatus(subtaskIds, status) {
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
async function insertTaskCard(taskCard) {
  try {
    const { data, error } = await supabase
      .from("task_cards")
      .insert([taskCard])
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    logError(`Error inserting task card: ${error.message}`, { taskCard });
    throw new Error(`Error inserting task card: ${error.message}`);
  }
}

/**
 * Adds a new head to the database.
 *
 * @param {string} task - The task associated with the head.
 * @param {string} description - The description of the head.
 * @param {number} userId - The ID of the user.
 * @param {number} chatroomId - The ID of the chatroom.
 * @returns {Object} - The inserted head object.
 * @throws {Error} - If the insertion fails.
 */
async function addHead(task, description, userId, chatroomId) {
  try {
    const { data, error } = await supabase
      .from("heads")
      .insert([{ task, description, user_id: userId, chatroom_id: chatroomId }])
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    logError(`Error adding head: ${error.message}`, { task, description, userId, chatroomId });
    throw new Error(`Error adding head: ${error.message}`);
  }
}

/**
 * Creates a new head in the database.
 *
 * @param {string} task - The task associated with the head.
 * @param {string} description - The description of the head.
 * @param {number} userId - The ID of the user.
 * @param {number} chatroomId - The ID of the chatroom.
 * @returns {Object} - The inserted head object.
 * @throws {Error} - If the insertion fails.
 */
async function createNewHead(task, description, userId, chatroomId) {
  try {
    const { data, error } = await supabase
      .from("heads")
      .insert([{ task, description, user_id: userId, chatroom_id: chatroomId, is_primary: false }])
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    logError(`Error creating new head: ${error.message}`, { task, description, userId, chatroomId });
    throw new Error(`Error creating new head: ${error.message}`);
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
async function fetchTaskCardsWithSubtasks(userId, chatroomId) {
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
 * Inserts or updates a feedback entry in the database.
 *
 * @param {string} responseId - The ID of the response.
 * @param {string} userFeedback - The user's feedback.
 * @param {number} rating - The rating provided by the user.
 * @throws {Error} - If inserting/updating the feedback entry fails.
 */
async function upsertFeedbackEntry(responseId, userFeedback, rating) {
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
    logError(`Error upserting feedback entry: ${error.message}`, { responseId, userFeedback, rating });
    throw new Error(`Error upserting feedback entry: ${error.message}`);
  }
}

/**
 * Inserts a task card, associates subtasks, and delegates them to heads.
 *
 * @param {Object} taskDetails - The main task details.
 * @param {Array<Object>} subtasks - Subtasks to associate and delegate.
 * @returns {Object} - Details of the inserted task card and subtasks.
 */
async function insertTaskCardWithDependencies(taskDetails, subtasks = []) {
  try {
    const { goal, priority, active, userId, chatroomId } = taskDetails;

    // Insert task card
    const { data: taskCard, error: taskCardError } = await supabase
      .from("task_cards")
      .insert({
        goal,
        priority,
        active,
        user_id: userId,
        chatroom_id: chatroomId,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (taskCardError) throw taskCardError;

    const subtaskResults = [];

    // Insert subtasks and delegate to heads
    for (const subtask of subtasks) {
      const { data: subtaskData, error: subtaskError } = await supabase
        .from("subtasks")
        .insert({
          task_card_id: taskCard.id,
          description: subtask.description,
          status: "pending",
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (subtaskError) throw subtaskError;

      // Delegate subtask to a new head
      const { data: headData, error: headError } = await supabase
        .from("heads")
        .insert({
          task: `Handle subtask: ${subtask.description}`,
          description: `Delegated from task: ${goal}`,
          user_id: userId,
          chatroom_id: chatroomId,
          created_at: new Date().toISOString(),
          preferences: JSON.stringify({ subtaskId: subtaskData.id }),
        })
        .select()
        .single();

      if (headError) throw headError;

      subtaskResults.push({
        subtask: subtaskData,
        delegatedTo: headData,
      });
    }

    return {
      taskCard,
      subtasks: subtaskResults,
    };
  } catch (error) {
    logError(`Error inserting task card with dependencies: ${error.message}`, { taskDetails, subtasks });
    throw new Error(`Error inserting task card with dependencies: ${error.message}`);
  }
}

/**
 * Fetches a task card and its associated subtasks.
 *
 * @param {number} taskCardId - The ID of the task card.
 * @returns {Object} - Task card details with subtasks and their statuses.
 */
async function fetchTaskCardWithSubtasks(taskCardId) {
  try {
    const { data, error } = await supabase
      .from("task_cards")
      .select(`
        id, goal, priority, active, created_at,
        subtasks (
          id, description, status, created_at
        )
      `)
      .eq("id", taskCardId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    logError(`Error fetching task card with subtasks: ${error.message}`, { taskCardId });
    throw new Error(`Error fetching task card with subtasks: ${error.message}`);
  }
}

// Consolidated exports
export {
  updateSubtasksStatus,
  insertTaskCard,
  addHead,
  createNewHead,
  fetchTaskCardsWithSubtasks,
  upsertFeedbackEntry,
  insertTaskCardWithDependencies,
  fetchTaskCardWithSubtasks,
};
