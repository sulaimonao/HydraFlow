// src/state/context_state.js
import { fetchContext, upsertContext, logInfo, logError, logDebugIssue } from '../util/context.js';

let currentContext = {};
const contextHistory = [];

export async function updateContext(newData, userId, chatroomId) {
  try {
    contextHistory.push({ ...currentContext });
    currentContext = { ...currentContext, ...newData };
    logInfo('Context updated in memory.', { newData, userId, chatroomId });
    await upsertContext(userId, chatroomId, currentContext);
    return currentContext;
  } catch (error) {
    logError(`Failed to update context: ${error.message}`);
    await logDebugIssue(userId, null, 'Context Update Failure', error.message);
    throw error;
  }
}

export async function getContext(userId, chatroomId) {
  try {
    const ctx = await fetchContext(userId, chatroomId);
    logInfo('Context fetched from database.', { userId, chatroomId, ctx });
    return ctx;
  } catch (error) {
    logError(`Failed to fetch context: ${error.message}`);
    await logDebugIssue(userId, null, 'Context Fetch Failure', error.message);
    throw error;
  }
}
