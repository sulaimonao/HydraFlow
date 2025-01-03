// src/state/memory_state.js
import { fetchMemory, updateMemory, logMemoryIssue } from "../util/memory.js";
import { logError, logInfo } from "../util/logging/logger.js";

export async function appendMemory(newMemory, userId, chatroomId) {
  try {
    const existingMemory = await fetchMemory(userId, chatroomId);
    const updatedMemory = `${existingMemory || ""} ${newMemory}`.trim();

    await updateMemory(userId, chatroomId, updatedMemory);
    logInfo(`Memory updated for user ${userId} in chatroom ${chatroomId}.`);

    return updatedMemory;
  } catch (error) {
    logError(`Failed to append memory: ${error.message}`);
    await logMemoryIssue(`Memory Append Failure: ${error.message}`);
    throw error;
  }
}

export async function getMemory(userId, chatroomId) {
  try {
    const memory = await fetchMemory(userId, chatroomId);
    logInfo(`Memory fetched for user ${userId}, chatroom ${chatroomId}.`);
    return memory || "";
  } catch (error) {
    logError(`Failed to fetch memory: ${error.message}`);
    await logMemoryIssue(`Memory Fetch Failure: ${error.message}`);
    throw error;
  }
}
