// src/actions/subpersona_creator.js
import { compressMemory } from "./memory_compressor.js";
import { logDebug } from "../util/logging/logger.js";

const activeHeads = {};

/**
 * Creates a subpersona for specific tasks.
 */
export function createSubpersona(task, description, user_id = null, chatroom_id = null) {
  const headId = `head_${Date.now()}`;
  activeHeads[headId] = {
    name: `Head for ${task}`,
    taskDescription: description,
    status: "active",
    memory: [],
    user_id,
    chatroom_id,
  };

  logDebug(`Created subpersona: ${headId}`, { task, description });
  return { headId, name: activeHeads[headId].name, status: "active" };
}

/**
 * Prunes a subpersona and integrates memory.
 */
export function pruneHead(headId, mainMemory) {
  if (activeHeads[headId]) {
    const compressedMemory = compressMemory(activeHeads[headId].memory).compressedMemory;
    delete activeHeads[headId];
    return { updatedMainMemory: `${mainMemory} ${compressedMemory}` };
  }
  return { error: "Head not found" };
}
