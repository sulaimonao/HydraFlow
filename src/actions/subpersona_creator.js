// src/actions/subpersona_creator.js
import { compressMemory } from "./memory_compressor.js";
import { logDebug } from "../util/logger.js";

const activeHeads = {}; // Store active heads temporarily

/**
 * Create a specialized subpersona for a task
 * @param {string} task - The task the subpersona will handle
 * @param {string} description - Description of the subpersona task
 * @param {string} [user_id] - Optional user ID for tracking
 * @param {string} [chatroom_id] - Optional chatroom ID for tracking
 * @returns {Object} Subpersona metadata
 */
function createSubpersona(task, description, user_id = null, chatroom_id = null) {
  const headId = `head_${Date.now()}`;
  activeHeads[headId] = {
    name: `Head for ${task}`,
    task_description: description,
    status: "active",
    memory: [],
    user_id,
    chatroom_id,
  };

  logDebug(`Created subpersona: ${headId}`, { task, description, user_id, chatroom_id });

  return { headId, name: activeHeads[headId].name, status: "active" };
}

/**
 * Assign task results to a head
 * @param {string} headId - ID of the subpersona head
 * @param {string} taskResult - Result of the task to assign
 * @returns {Object} Status and result
 */
function assignHeadTask(headId, taskResult) {
  if (activeHeads[headId]) {
    activeHeads[headId].memory.push(taskResult);
    logDebug(`Assigned task to head: ${headId}`, { taskResult });

    return { status: "updated", headId, taskResult };
  }

  logDebug(`Error: Head not found for assignment`, { headId });
  return { error: "Head not found", headId };
}

/**
 * Prune a head and merge its results back into main memory
 * @param {string} headId - ID of the subpersona head
 * @param {string} mainMemory - Existing main memory to merge results into
 * @returns {Object} Updated main memory or error
 */
function pruneHead(headId, mainMemory) {
  if (activeHeads[headId]) {
    const headMemory = activeHeads[headId].memory.join(". ");
    const compressedResult = compressMemory(headMemory).compressedMemory;

    logDebug(`Pruning head: ${headId}`, { headMemory, compressedResult });

    delete activeHeads[headId]; // Remove the head after pruning
    return { updatedMainMemory: mainMemory + ` ${compressedResult}` };
  }

  logDebug(`Error: Head not found for pruning`, { headId });
  return { error: "Head not found for pruning", headId };
}

export { createSubpersona, assignHeadTask, pruneHead };
