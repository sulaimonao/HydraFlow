// src/state/context_state.js
import { supabase } from "../../lib/db.js";

let currentContext = {};
const contextHistory = [];

export async function updateContext(newData, user_id, chatroom_id) {
  // Save old context to history
  contextHistory.push({ ...currentContext });
  // Merge new
  currentContext = { ...currentContext, ...newData };

  // Upsert the context into the "contexts" table
  const { error } = await supabase
    .from("contexts")
    .upsert({
      user_id,
      chatroom_id,
      data: currentContext,             // store the entire object in JSON
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error("Error updating context in Supabase:", error);
  }

  return currentContext;
}

export async function getContext(user_id, chatroom_id) {
  // Single record by user/chat
  const { data, error } = await supabase
    .from("contexts")
    .select("*")
    .eq("user_id", user_id)
    .eq("chatroom_id", chatroom_id)
    .single();

  if (error) {
    console.error("Error fetching context:", error);
    return currentContext; // fallback
  }

  if (data?.data) {
    currentContext = data.data; // Load from DB
  }
  return currentContext;
}

export function getContextHistory() {
  return contextHistory;
}

export { currentContext };
