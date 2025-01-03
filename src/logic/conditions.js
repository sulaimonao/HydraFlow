// src/logic/conditions.js
import { fetchExistingHead } from "../util/database/db_helpers.js";
import Joi from "joi";

const COMPRESSION_THRESHOLD = 20;
const INITIAL_COMPRESSION_THRESHOLD = 10;
const TOKEN_LIMIT = 1000;
const MAX_HEADS = 5;

const actionItemsSchema = Joi.array().items(
  Joi.string().valid("create head", "summarize logs", "compress memory")
);

const validateActionItems = (actionItems) => {
  const { error, value } = actionItemsSchema.validate(actionItems);
  if (error) {
    throw new Error(`Validation error: ${error.message}`);
  }
  return value;
};

export const shouldCreateHead = (actionItems) => {
  validateActionItems(actionItems);
  return actionItems.includes("create head");
};

export const shouldSummarizeLogs = (actionItems) => {
  validateActionItems(actionItems);
  return actionItems.includes("summarize logs");
};

export const shouldCompress = (actionItems, conversationLength) => {
  const contextPriority = currentContext.priority || "Normal";
  const adjustedThreshold =
    contextPriority === "High" ? COMPRESSION_THRESHOLD / 2 : COMPRESSION_THRESHOLD;

  return actionItems.includes("summarize") && conversationLength > adjustedThreshold;
};

export const needsContextRecap = (conversationLength, userEngagement) => {
  const contextGoal = currentContext.goal || "General";

  return (
    contextGoal === "Complex" ||
    conversationLength > INITIAL_COMPRESSION_THRESHOLD ||
    userEngagement < 50
  );
};

export const hasPendingDependencies = (taskId, user_id, chatroom_id) => {
  const taskCard = getTaskCard(taskId, user_id, chatroom_id);

  if (!taskCard) {
    console.warn(`Task ${taskId} not found for user ${user_id} in chatroom ${chatroom_id}`);
    return false;
  }

  return taskCard.subtasks.some((subtask) => subtask.dependencies.length > 0);
};

export const shouldCompressMemory = (tokenCount) => tokenCount > TOKEN_LIMIT;

export const canCreateNewHead = (headCount) => headCount < MAX_HEADS;

export const isContextReady = () => currentContext.status === "active";

export const isUrgentTask = (taskPriority) => taskPriority === "High";
