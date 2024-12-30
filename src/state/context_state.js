// src/state/context_state.js

import { fetchContext, upsertContext } from "../util/db_helpers.js";

let currentContext = {};
const contextHistory = [];

export async function updateContext(newData, userId, chatroomId) {
  contextHistory.push({ ...currentContext });
  currentContext = { ...currentContext, ...newData };
  await upsertContext(userId, chatroomId, currentContext);
  return currentContext;
}

export async function getContext(userId, chatroomId) {
  return await fetchContext(userId, chatroomId);
}

export function getContextHistory() {
  return contextHistory;
}

export { currentContext };
