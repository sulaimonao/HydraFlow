// src/state/memory_state.js

import { supabase } from "../../lib/db.js";

let memory = ""; // In-memory fallback

export async function appendMemory(newMemory, userId, chatroomId) {
  memory += ` ${newMemory}`;

  // Upsert into "memories" table
  const { error } = await supabase
    .from("memories")
    .upsert({
      user_id: userId,
      chatroom_id: chatroomId,
      memory,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error("Error updating memory in Supabase:", error);
  }

  return memory;
}

export async function getMemory(userId, chatroomId) {
  // Instead of .single(), do normal select
  const { data, error } = await supabase
    .from("memories")
    .select("*")
    .eq("user_id", userId)
    .eq("chatroom_id", chatroomId);

  if (error) {
    console.error("Error fetching memory from Supabase:", error);
    return memory; // fallback
  }

  if (!data || data.length === 0) {
    console.log("No existing memory row found, returning fallback memory...");
    return memory;
  }

  const row = data[0];
  if (row?.memory) {
    memory = row.memory;
  }
  return memory;
}
