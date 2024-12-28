// src/logic/conditions.js
import { currentContext } from "../state/context_state.js";
import { getTaskCard } from "../state/task_manager.js";

const COMPRESSION_THRESHOLD = 20;
const INITIAL_COMPRESSION_THRESHOLD = 10;

const shouldCreateHead = (actionItems) => {
  return actionItems.includes("create head");
};

const shouldSummarizeLogs = (actionItems) => {
  return actionItems.includes("summarize logs");
};

const shouldCompress = (actionItems, conversationLength) => {
  const contextPriority = currentContext.priority || "Normal";
  const adjustedThreshold =
    contextPriority === "High" ? COMPRESSION_THRESHOLD / 2 : COMPRESSION_THRESHOLD;

  return (
    actionItems.includes("summarize") &&
    conversationLength > adjustedThreshold
  );
};

const needsContextRecap = (conversationLength, userEngagement) => {
  const contextGoal = currentContext.goal || "General";

  if (contextGoal === "Complex") {
    return true;
  }

  return (
    conversationLength > INITIAL_COMPRESSION_THRESHOLD ||
    userEngagement < 50
  );
};

const hasPendingDependencies = (taskId, userId, chatroomId) => {
  const taskCard = getTaskCard(taskId, userId, chatroomId);

  if (!taskCard) {
    console.warn(`Task ${taskId} not found for user ${userId} in chatroom ${chatroomId}`);
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
