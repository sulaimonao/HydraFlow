// src/util/database/db_helpers.js
import { supabase } from "../../../lib/db.js";
import { logError } from "../logging/logger.js"; // Updated logger path

/**
 * Updates the status of multiple subtasks in bulk.
 */
async function updateSubtasksStatus(subtaskIds, status) {
  if (!subtaskIds || !Array.isArray(subtaskIds) || !status) {
    throw new Error("Invalid input: Subtask IDs and status are required.");
  }
  try {
    const { error } = await supabase
      .from("subtasks")
      .update({ status })
      .in("id", subtaskIds);

    if (error) throw error;
  } catch (error) {
    logError(`Error updating subtasks: ${error.message}`, { subtaskIds });
    throw error;
  }
}

/**
 * Inserts a new task card into the database.
 */
async function insertTaskCard(taskCard) {
  if (!taskCard.goal || !taskCard.user_id || !taskCard.chatroom_id) {
    throw new Error("Invalid input: Task card details are incomplete.");
  }
  try {
    const { data, error } = await supabase
      .from("task_cards")
      .insert([taskCard])
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    logError(`Error inserting task card: ${error.message}`, { taskCard });
    throw error;
  }
}

/**
 * Adds a new head to the database.
 */
async function addHead(task, description, userId, chatroomId) {
  if (!task || !description || !userId || !chatroomId) {
    throw new Error("Invalid input: Missing head details.");
  }
  try {
    const { data, error } = await supabase
      .from("heads")
      .insert([{ task, description, user_id: userId, chatroom_id: chatroomId }])
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    logError(`Error adding head: ${error.message}`, { task, description, userId, chatroomId });
    throw error;
  }
}

/**
 * Fetches all task cards with subtasks for a user and chatroom.
 */
async function fetchTaskCardsWithSubtasks(userId, chatroomId) {
  if (!userId || !chatroomId) {
    throw new Error("Invalid input: User ID and chatroom ID are required.");
  }
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
    throw error;
  }
}

/**
 * Fetches a single task card with its subtasks.
 */
async function fetchTaskCardWithSubtasks(taskCardId) {
  if (!taskCardId) {
    throw new Error("Invalid input: Task card ID is required.");
  }
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
    throw error;
  }
}

// Consolidated exports
export {
  updateSubtasksStatus,
  insertTaskCard,
  addHead,
  fetchTaskCardsWithSubtasks,
  fetchTaskCardWithSubtasks,
};
