// src/state/heads_state.js
import { supabase } from "../../lib/db.js";

const heads = []; // In-memory fallback

export async function addHead(name, status, userId, chatroomId) {
  const newHead = {
    name,
    status,
    createdAt: Date.now(),
    userId,
    chatroomId,
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

export async function getHeads(userId, chatroomId) {
  // Attempt to retrieve from DB
  const { data, error } = await supabase
    .from("heads")
    .select("*")
    .eq("userId", userId)
    .eq("chatroomId", chatroomId);

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
