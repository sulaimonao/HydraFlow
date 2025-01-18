// src/logic/conditions.js
import { currentContext } from "../state/context_state.js";
import { getTaskCard } from "../state/task_manager.js";
import { orchestrateContextWorkflow } from "./workflow_manager.js";

// 📊 Dynamic thresholds based on context priority
const COMPRESSION_THRESHOLD = 20;
const INITIAL_COMPRESSION_THRESHOLD = 10;

/**
 * 🔍 Retrieves session identifiers securely.
 * @param {string} query - User query for context workflow.
 * @param {Object} req - HTTP request for session context.
 * @returns {Object} - Extracted user and chatroom IDs.
 */
const getSessionIdentifiers = async (query, req) => {
  const userId = req.session.userId;
  const chatroomId = req.session.chatroomId;

  if (!userId || !chatroomId) {
    throw new Error("❗ Missing userId or chatroomId in session.");
  }

  return { user_id: userId, chatroom_id: chatroomId };
};

/**
 * ✅ Checks if a head/subpersona should be created based on action items.
 */
const shouldCreateHead = async (actionItems, query, req) => {
  await getSessionIdentifiers(query, req);
  return actionItems.includes("create head");
};

/**
 * ✅ Checks if logs need to be summarized.
 */
const shouldSummarizeLogs = async (actionItems, query, req) => {
  await getSessionIdentifiers(query, req);
  return actionItems.includes("summarize logs");
};

/**
 * ✅ Determines if memory compression is necessary.
 */
const shouldCompress = async (actionItems, conversationLength, query, req) => {
  await getSessionIdentifiers(query, req);

  const contextPriority = currentContext.priority || "Normal";
  const adjustedThreshold =
    contextPriority === "High" ? COMPRESSION_THRESHOLD / 2 : COMPRESSION_THRESHOLD;

  return (
    actionItems.includes("summarize") &&
    conversationLength > adjustedThreshold
  );
};

/**
 * ✅ Determines if a context recap is required.
 */
const needsContextRecap = async (conversationLength, userEngagement, query, req) => {
  await getSessionIdentifiers(query, req);

  const contextGoal = currentContext.goal || "General";

  if (contextGoal === "Complex") {
    return true;
  }

  return (
    conversationLength > INITIAL_COMPRESSION_THRESHOLD ||
    userEngagement < 50
  );
};

/**
 * ✅ Checks if a task has any pending dependencies.
 */
const hasPendingDependencies = async (taskId, query, req) => {
  const { user_id, chatroom_id } = await getSessionIdentifiers(query, req)

  const taskCard = await getTaskCard(taskId, user_id, chatroom_id)
  if (!taskCard) {
    console.warn(`⚠️ Task ${taskId} not found for user: ${user_id}`);
    return false;
  }

  return taskCard.subtasks.some((subtask) => subtask.dependencies.length > 0);
};

export {
  COMPRESSION_THRESHOLD,
  INITIAL_COMPRESSION_THRESHOLD,
  shouldCreateHead,
  shouldSummarizeLogs,
  shouldCompress,
  needsContextRecap,
  hasPendingDependencies,
};
