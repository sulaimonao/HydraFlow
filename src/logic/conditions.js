// src/logic/conditions.js

import { fetchExistingHead } from '../util'; 

/**
 * Existing thresholds
 */
const COMPRESSION_THRESHOLD = 20;
const INITIAL_COMPRESSION_THRESHOLD = 10;

/**
 * NEW token limit and max heads
 */
const TOKEN_LIMIT = 1000;
const MAX_HEADS = 5;

/**
 * Existing condition: determines if we should create a head
 */
export const shouldCreateHead = (actionItems) => {
  return actionItems.includes('create head');
};

/**
 * Existing condition: determines if we should summarize logs
 */
export const shouldSummarizeLogs = (actionItems) => {
  return actionItems.includes('summarize logs');
};

/**
 * Existing condition: determines if memory compression is needed based on
 * conversation length plus priority
 */
export const shouldCompress = (actionItems, conversationLength) => {
  const contextPriority = currentContext.priority || 'Normal';
  const adjustedThreshold =
    contextPriority === 'High' ? COMPRESSION_THRESHOLD / 2 : COMPRESSION_THRESHOLD;

  return actionItems.includes('summarize') && conversationLength > adjustedThreshold;
};

/**
 * Existing condition: determines if a context recap is needed based on
 * conversation length and user engagement
 */
export const needsContextRecap = (conversationLength, userEngagement) => {
  const contextGoal = currentContext.goal || 'General';

  if (contextGoal === 'Complex') {
    return true;
  }

  return (
    conversationLength > INITIAL_COMPRESSION_THRESHOLD ||
    userEngagement < 50
  );
};

/**
 * Existing condition: checks for pending dependencies in a particular task
 */
export const hasPendingDependencies = (taskId, user_id, chatroom_id) => {
  const taskCard = getTaskCard(taskId, user_id, chatroom_id);

  if (!taskCard) {
    console.warn(`Task ${taskId} not found for user ${user_id} in chatroom ${chatroom_id}`);
    return false;
  }

  return taskCard.subtasks.some((subtask) => subtask.dependencies.length > 0);
};

/**
 * NEW condition: checks if we should compress memory due to high token usage
 */
export const shouldCompressMemory = (tokenCount) => {
  return tokenCount > TOKEN_LIMIT;
};

/**
 * NEW condition: checks if we can create a new head or if we've reached max
 */
export const canCreateNewHead = (headCount) => {
  return headCount < MAX_HEADS;
};

/**
 * NEW condition: checks if the current context is ready for further actions
 */
export const isContextReady = () => {
  const contextStatus = currentContext.status || 'active';
  return contextStatus === 'active';
};

/**
 * NEW condition: determines if the task requires urgent processing
 */
export const isUrgentTask = (taskPriority) => {
  return taskPriority === 'High';
};
