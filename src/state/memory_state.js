// src/state/memory_state.js

import { db } from "../../lib/db.js";

let memory = ""; // In-memory fallback

export async function appendMemory(newMemory, userId, chatroomId) {
  memory += ` ${newMemory}`;

  // Save the updated memory to the database
  await db.memories.update(
    { userId, chatroomId },
    { $set: { memory } },
    { upsert: true }
  );

  return memory;
}

export async function getMemory(userId, chatroomId) {
  const dbMemory = await db.memories.findOne({ userId, chatroomId });
  if (dbMemory) {
    memory = dbMemory.memory;
  }
  return memory;
}
