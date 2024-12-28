// src/state/context_state.js
import { supabase } from "../../lib/db.js"; // or however you export it

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
      userId,
      chatroomId,
      data: currentContext,             // store the entire object in JSON
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error("Error updating context in Supabase:", error);
  }

  return currentContext;
}

export async function getContext(userId, chatroomId) {
  // Single record by user/chat
  const { data, error } = await supabase
    .from("contexts")
    .select("*")
    .eq("userId", userId)
    .eq("chatroomId", chatroomId)
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
