// src/state/memory_state.js

import { fetchMemory, upsertMemory,
  logInfo, logError,
  logDebugIssue 
 } from "../util/index.js";

/**
 * Appends new memory to the existing memory for a user in a chatroom.
 *
 * @param {string} newMemory - The new memory content to append.
 * @param {string} userId - The user ID.
 * @param {string} chatroomId - The chatroom ID.
 * @returns {string} - The updated memory.
 */
export async function appendMemory(newMemory, userId, chatroomId) {
  try {
    const existingMemory = await fetchMemory(userId, chatroomId);
    const updatedMemory = `${existingMemory || ""} ${newMemory}`.trim();

    await upsertMemory(userId, chatroomId, updatedMemory);
    logInfo(`Memory updated for user ${userId} in chatroom ${chatroomId}.`);

    return updatedMemory;
  } catch (error) {
    logError(`Failed to append memory: ${error.message}`);
    await logDebugIssue(userId, null, "Memory Append Failure", error.message);
    throw error;
  }
}

/**
 * Retrieves the memory for a user in a chatroom.
 *
 * @param {string} userId - The user ID.
 * @param {string} chatroomId - The chatroom ID.
 * @returns {string} - The fetched memory string.
 */
export async function getMemory(userId, chatroomId) {
  try {
    const memory = await fetchMemory(userId, chatroomId);
    logInfo(`Memory fetched for user ${userId}, chatroom ${chatroomId}.`);
    return memory || "";
  } catch (error) {
    logError(`Failed to fetch memory: ${error.message}`);
    await logDebugIssue(userId, null, "Memory Fetch Failure", error.message);
    throw error;
  }
}
