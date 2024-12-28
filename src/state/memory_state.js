// src/state/memory_state.js
import { supabase } from "../../lib/db.js";

let memory = ""; // local fallback

export async function appendMemory(newMemory, user_id, chatroom_id) {
  memory += ` ${newMemory}`;

  // Upsert into "memories" table
  const { error } = await supabase
    .from("memories")
    .upsert({
      user_id,
      chatroom_id,
      memory,                     // store the updated memory string
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error("Error updating memory in Supabase:", error);
  }

  return memory;
}

export async function getMemory(user_id, chatroom_id) {
  // Retrieve from DB
  const { data, error } = await supabase
    .from("memories")
    .select("*")
    .eq("user_id", user_id)
    .eq("chatroom_id", chatroom_id)
    .single();

  if (error) {
    console.error("Error fetching memory from Supabase:", error);
    // fallback to in-memory
    return memory;
  }

  if (data?.memory) {
    memory = data.memory;
  }
  return memory;
}
