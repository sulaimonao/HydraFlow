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

// Fetch gauge data for a user and chatroom
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

// Export other helpers if required
export {
  fetchAllTasksWithDetails,
  fetchGaugeData,
};
