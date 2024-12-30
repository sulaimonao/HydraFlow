// src/state/memory_state.js

import { fetchMemory, upsertMemory } from "../util/db_helpers.js";

export async function appendMemory(newMemory, userId, chatroomId) {
  const existingMemory = await fetchMemory(userId, chatroomId);
  const updatedMemory = `${existingMemory} ${newMemory}`;
  await upsertMemory(userId, chatroomId, updatedMemory);
  return updatedMemory;
}

export async function getMemory(userId, chatroomId) {
  return await fetchMemory(userId, chatroomId);
}
