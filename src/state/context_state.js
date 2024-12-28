// src/state/context_state.js
import { supabase } from "../../lib/db.js";

let currentContext = {};
const contextHistory = [];

export async function updateContext(newData, userId, chatroomId) {
  // Save old context to history
  contextHistory.push({ ...currentContext });
  // Merge new
  currentContext = { ...currentContext, ...newData };

  // Upsert the context into the "contexts" table
  const { error } = await supabase
    .from("contexts")
    .upsert({
      user_id: userId,
      chatroom_id: chatroomId,
      data: currentContext,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error("Error updating context in Supabase:", error);
  }

  return currentContext;
}

export async function getContext(userId, chatroomId) {
  // Instead of .single(), let's do a normal select
  const { data, error } = await supabase
    .from("contexts")
    .select("*")
    .eq("user_id", userId)
    .eq("chatroom_id", chatroomId);

  if (error) {
    console.error("Error fetching context:", error);
    return currentContext; // fallback
  }

  if (!data || data.length === 0) {
    // No rows found
    console.log("No existing context row found, returning fallback context...");
    return currentContext;
  }

  // If multiple rows, just take the first (unlikely unless we upsert incorrectly)
  const row = data[0];
  if (row?.data) {
    currentContext = row.data;
  }
  return currentContext;
}

export function getContextHistory() {
  return contextHistory;
}

export { currentContext };
