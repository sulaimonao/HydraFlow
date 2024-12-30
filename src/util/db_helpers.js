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
    logError(`Error fetching tasks: ${error.message}`);
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
    logError(`Error fetching memory: ${error.message}`);
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
    logError(`Error updating memory: ${error.message}`);
    throw new Error(`Error updating memory: ${error.message}`);
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
    logError(`Error updating subtasks: ${error.message}`);
    throw new Error(`Error updating subtasks: ${error.message}`);
  }
}
