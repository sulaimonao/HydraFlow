//context_state.js

import { db } from "../../lib/db.js";

let currentContext = {};
const contextHistory = [];

export async function updateContext(newData, userId, chatroomId) {
  contextHistory.push({ ...currentContext }); // Save a snapshot before updating
  currentContext = { ...currentContext, ...newData };

  // Save context in the database
  await db.contexts.update(
    { userId, chatroomId },
    { $set: currentContext },
    { upsert: true }
  );

  return currentContext;
}

export async function getContext(userId, chatroomId) {
  const context = await db.contexts.findOne({ userId, chatroomId });
  if (context) {
    currentContext = context;
  }
  return currentContext;
}

export function getContextHistory() {
  return contextHistory;
}

export { currentContext };

