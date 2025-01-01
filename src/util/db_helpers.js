// src/util/db_helpers.js

import { supabase } from "../../lib/db.js";
import { logError } from "./logger.js";

// Fetch all tasks with subtasks and dependencies
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
    logError(`Error fetching tasks: ${error.message}`, { userId, chatroomId });
    throw new Error(`Error fetching tasks: ${error.message}`);
  }
}

// Fetch memory for a user and chatroom
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

// Insert or update memory
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

// Add a new head
export async function addHead({ userId, chatroomId, headData }) {
  try {
    const { data, error } = await supabase
      .from("heads")
      .insert({
        user_id: userId,
        chatroom_id: chatroomId,
        ...headData,
      });

    if (error) throw error;
    return data;
  } catch (error) {
    logError(`Error adding head: ${error.message}`, { userId, chatroomId, headData });
    throw new Error(`Error adding head: ${error.message}`);
  }
}

// Fetch an existing head
export async function fetchExistingHead({ userId, chatroomId }) {
  try {
    const { data, error } = await supabase
      .from("heads")
      .select("*")
      .eq("user_id", userId)
      .eq("chatroom_id", chatroomId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    logError(`Error fetching existing head: ${error.message}`, { userId, chatroomId });
    throw new Error(`Error fetching existing head: ${error.message}`);
  }
}

// Update subtasks status in bulk
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

// Other utility functions...
export {
  fetchAllTasksWithDetails,
  fetchMemory,
  upsertMemory,
  updateSubtasksStatus,
  addHead,
  fetchExistingHead,
};
