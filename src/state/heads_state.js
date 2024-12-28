// src/state/heads_state.js
import { supabase } from "../../lib/db.js";

const heads = []; // In-memory fallback

export async function addHead(name, status, user_id, chatroom_id) {
  const newHead = {
    name,
    status,
    createdAt: Date.now(),
    user_id,
    chatroom_id,
  };

  // Insert into "heads" table
  const { error } = await supabase
    .from("heads")
    .insert([newHead]);

  if (error) {
    console.error("Error inserting new head:", error);
  }

  // Also push to the in-memory store (fallback)
  heads.push(newHead);

  return newHead;
}

export async function getHeads(user_id, chatroom_id) {
  // Attempt to retrieve from DB
  const { data, error } = await supabase
    .from("heads")
    .select("*")
    .eq("user_id", user_id)
    .eq("chatroom_id", chatroom_id);

  if (error) {
    console.error("Error fetching heads from Supabase:", error);
    return heads; // fallback
  }

  // If we got something from DB, return it
  if (data.length) {
    return data;
  } else {
    return heads; // fallback
  }
}
