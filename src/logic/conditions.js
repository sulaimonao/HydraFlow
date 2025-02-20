// src/logic/conditions.js (Local SQLite Version - Minimal Changes)
import { currentContext } from "../state/context_state.js";
import { getTaskCard } from "../state/task_manager.js";
import { orchestrateContextWorkflow } from "./workflow_manager.js";

// 📊 Dynamic thresholds based on context priority
const COMPRESSION_THRESHOLD = 20;
const INITIAL_COMPRESSION_THRESHOLD = 10;

/**
 * 🔍 Retrieves session identifiers securely.
 * @param {string} query - User query for context workflow. (Not directly used, but kept for consistency)
 * @param {Object} req - HTTP request for session context.
 * @returns {Object} - Extracted user and chatroom IDs.
 */
const getSessionIdentifiers = async (query, req) => { // Keep query parameter
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
    await getSessionIdentifiers(query, req); // Keep this call for consistency, even though it's not strictly needed here
    return actionItems.includes("create head") || actionItems.includes("create-subpersona") || actionItems.includes("create persona"); // Added create-subpersona and create persona
};

/**
 * ✅ Checks if logs need to be summarized.
 */
const shouldSummarizeLogs = async (actionItems, query, req) => {
    await getSessionIdentifiers(query, req); // Keep for consistency
    return actionItems.includes("summarize logs") || actionItems.includes("summarize-logs"); // Added "summarize-logs"
};

/**
 * ✅ Determines if memory compression is necessary.
 */
const shouldCompress = async (actionItems, conversationLength, query, req) => {
    await getSessionIdentifiers(query, req); // Keep for consistency

    const contextPriority = currentContext.priority || "Normal";
    const adjustedThreshold =
        contextPriority === "High" ? COMPRESSION_THRESHOLD / 2 : COMPRESSION_THRESHOLD;

    return (
        // Keep original condition, and add checks for actionItems
        (actionItems.includes("compress-memory") || actionItems.includes("compress memory") || actionItems.includes("optimize memory")) && conversationLength > adjustedThreshold
    );
};

/**
 * ✅ Determines if a context recap is required.
 */
const needsContextRecap = async (conversationLength, userEngagement, query, req) => {
    await getSessionIdentifiers(query, req);  // Keep for consistency

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
    const { user_id, chatroom_id } = await getSessionIdentifiers(query, req);

    // Assuming getTaskCard can now handle just taskId, userId, and chatroomId
    const taskCard = await getTaskCard(taskId, user_id, chatroom_id); // Pass user_id and chatroom_id
    if (!taskCard) {
        console.warn(`⚠️ Task ${taskId} not found for user: ${user_id}`);
        return false;
    }
   if (taskCard.subtasks && Array.isArray(taskCard.subtasks)) {
        return taskCard.subtasks.some((subtask) => subtask.dependencies && subtask.dependencies.length > 0);
    }
    return false;
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