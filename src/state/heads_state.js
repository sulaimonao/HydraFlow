// src/state/heads_state.js
import {
  addHead,
  fetchExistingHead,
  fetchGaugeData,
  logDebugIssue,
  logInfo,
  logError,
} from "../util/heads.js";
import { validateInputs } from "../util/validation.js";

export async function createOrFetchHead(task, description, user_id, chatroom_id) {
  try {
    validateInputs({ task, description, user_id, chatroom_id });

    const existingHead = await fetchExistingHead(task, user_id, chatroom_id);
    if (existingHead) {
      logInfo(`Existing head found for task "${task}" in chatroom "${chatroom_id}".`);
      return existingHead;
    }

    const newHead = await addHead(task, description, user_id, chatroom_id);
    logInfo(`New head created for user ${user_id} in chatroom ${chatroom_id}`, { newHead });
    return newHead;
  } catch (error) {
    logError(`Failed to create or fetch head: ${error.message}`);
    await logDebugIssue(user_id, chatroom_id, "Heads State Failure", error.message);
    throw error;
  }
}

export async function getUpdatedGaugeData(user_id, chatroom_id) {
  try {
    validateInputs({ user_id, chatroom_id });

    const gaugeData = await fetchGaugeData({ userId: user_id, chatroomId: chatroom_id });
    logInfo("Gauge data fetched successfully.", { gaugeData });
    return gaugeData;
  } catch (error) {
    logError(`Failed to fetch gauge data: ${error.message}`);
    await logDebugIssue(user_id, chatroom_id, "Gauge Data Failure", error.message);
    return null;
  }
}
