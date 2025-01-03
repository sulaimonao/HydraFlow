// src/util/memory.js
import { logError, logInfo } from "./logger.js";
/**
 * Fetches memory for a user in a chatroom.
 * @param {string} userId - The user ID.
 * @param {string} chatroomId - The chatroom ID.
 * @returns {Array} - A list of memory entries.
 */
export async function fetchMemory(userId, chatroomId) {
    console.log(`Fetching memory for user ${userId} in chatroom ${chatroomId}`);
    return []; // Return an empty array as a placeholder
  }
  
  /**
   * Updates memory for a user in a chatroom.
   * @param {string} userId - The user ID.
   * @param {string} chatroomId - The chatroom ID.
   * @param {Array} memory - The updated memory entries.
   */
  export async function updateMemory(userId, chatroomId, memory) {
    console.log(`Updating memory for user ${userId} in chatroom ${chatroomId}`);
  }
  
  export { logError, logInfo }; // Ensure logError is exported