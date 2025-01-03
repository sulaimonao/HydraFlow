// src/state/heads_state.js
import { addHead, fetchExistingHead, fetchGaugeData, logDebugIssue, logInfo, logError } from "../util/heads.js";


/**
 * Creates or fetches a head (sub-persona) for a user.
 *
 * @param {string} task - The task name or function of the sub-persona.
 * @param {string} description - Description for the sub-persona's purpose.
 * @param {string} user_id - The user ID.
 * @param {string} chatroom_id - The chatroom ID.
 * @returns {Object} - The new or existing head object.
 */
export async function createOrFetchHead(task, description, user_id, chatroom_id) {
  try {
    // Check for existing head
    const existingHead = await fetchExistingHead(task, user_id, chatroom_id);
    if (existingHead) {
      logInfo(`Existing head found for task "${task}" in chatroom "${chatroom_id}".`);
      return existingHead;
    }

    // Otherwise, create a new head
    const newHead = await addHead(task, description, user_id, chatroom_id);
    logInfo(`New head created for user ${user_id} in chatroom ${chatroom_id}`, { newHead });
    return newHead;
  } catch (error) {
    logError(`Failed to create or fetch head: ${error.message}`);
    await logDebugIssue(user_id, null, "Heads State Failure", error.message);
    throw error;
  }
}

/**
 * Fetches updated gauge data after sub-persona creation or modifications.
 *
 * @param {string} user_id - The user ID.
 * @param {string} chatroom_id - The chatroom ID.
 * @returns {Object|null} - Gauge data or null if unavailable.
 */
export async function getUpdatedGaugeData(user_id, chatroom_id) {
  try {
    const gaugeData = await fetchGaugeData({ userId: user_id, chatroomId: chatroom_id });
    logInfo("Gauge data fetched successfully.", { gaugeData });
    return gaugeData;
  } catch (error) {
    logError(`Failed to fetch gauge data: ${error.message}`);
    await logDebugIssue(user_id, null, "Gauge Data Failure", error.message);
    return null;
  }
}
