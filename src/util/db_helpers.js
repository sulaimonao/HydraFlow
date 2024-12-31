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

// Fetch contexts for a specific user and chatroom
export async function fetchContexts(userId, chatroomId) {
  try {
    const { data, error } = await supabase
      .from("contexts")
      .select("data, updated_at")
      .eq("user_id", userId)
      .eq("chatroom_id", chatroomId);

    if (error) throw error;
    return data;
  } catch (error) {
    logError(`Error fetching contexts: ${error.message}`, { userId, chatroomId });
    throw new Error(`Error fetching contexts: ${error.message}`);
  }
}

// Log debug issues
export async function logDebugIssue(userId, contextId, issue, resolution) {
  try {
    const { error } = await supabase
      .from("debug_logs")
      .insert({
        user_id: userId,
        context_id: contextId,
        issue,
        resolution,
        timestamp: new Date().toISOString(),
      });

    if (error) throw error;
  } catch (error) {
    logError(`Error logging debug issue: ${error.message}`, { userId, contextId });
    throw new Error(`Error logging debug issue: ${error.message}`);
  }
}

// Fetch all templates
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

// Insert or update a feedback entry
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
