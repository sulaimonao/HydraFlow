// src/state/context_state.js

import { fetchContext, upsertContext } from "../util/db_helpers.js";
import { logInfo, logError } from "../util/logger.js";
import { logDebugIssue } from "../util/db_helpers.js";

let currentContext = {};
const contextHistory = [];

/**
 * Updates the current context for a user in a chatroom,
 * persisting it to the database. Also logs a debug entry if needed.
 *
 * @param {Object} newData - Key-value pairs to update in the context.
 * @param {string} userId - The user ID.
 * @param {string} chatroomId - The chatroom ID.
 * @returns {Object} - The updated context.
 */
export async function updateContext(newData, userId, chatroomId) {
  try {
    // Push previous context to history
    contextHistory.push({ ...currentContext });

    // Merge new data into context
    currentContext = { ...currentContext, ...newData };
    logInfo("Context updated in memory.", { newData, userId, chatroomId });

    // Persist the updated context
    await upsertContext(userId, chatroomId, currentContext);
    logInfo("Context persisted to database.", { userId, chatroomId });

    return currentContext;
  } catch (error) {
    logError(`Failed to update context: ${error.message}`);
    // Optionally store a debug log for context update failures
    await logDebugIssue(userId, null, "Context Update Failure", error.message);
    throw error;
  }
}

/**
 * Retrieves the context for a given user and chatroom.
 *
 * @param {string} userId - The user ID.
 * @param {string} chatroomId - The chatroom ID.
 * @returns {Object|null} - The context object or null if not found.
 */
export async function getContext(userId, chatroomId) {
  try {
    const ctx = await fetchContext(userId, chatroomId);
    logInfo("Context fetched from database.", { userId, chatroomId, ctx });
    return ctx;
  } catch (error) {
    logError(`Failed to fetch context: ${error.message}`);
    await logDebugIssue(userId, null, "Context Fetch Failure", error.message);
    throw error;
  }
}

/**
 * Returns the in-memory history of context changes.
 *
 * @returns {Array} - An array of previous context states.
 */
export function getContextHistory() {
  return contextHistory;
}

// The current in-memory context object
export { currentContext };
