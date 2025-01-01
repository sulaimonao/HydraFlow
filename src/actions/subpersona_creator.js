// src/actions/subpersona_creator.js
import { compressMemory } from './memory_compressor.js';
import { logDebug } from '../util/logger.js';
import { fetchExistingHead, addHead, fetchGaugeData } from '../util/db_helpers.js'; // Correct named imports

const activeHeads = {}; // Store active heads temporarily

/**
 * Create a specialized subpersona for a task
 */
export function createSubpersona(task, description, user_id = null, chatroom_id = null) {
  const headId = `head_${Date.now()}`;
  activeHeads[headId] = {
    name: `Head for ${task}`,
    task_description: description,
    status: 'active',
    memory: [],
    user_id,
    chatroom_id,
  };

  logDebug(`Created subpersona: ${headId}`, { task, description, user_id, chatroom_id });

  return { headId, name: activeHeads[headId].name, status: 'active' };
}

/**
 * Assign task results to a head
 */
export function assignHeadTask(headId, taskResult) {
  if (activeHeads[headId]) {
    activeHeads[headId].memory.push(taskResult);
    logDebug(`Assigned task to head: ${headId}`, { taskResult });

    return { status: 'updated', headId, taskResult };
  }

  logDebug(`Error: Head not found for assignment`, { headId });
  return { error: 'Head not found', headId };
}

/**
 * Prune a head and merge its results back into main memory
 */
export function pruneHead(headId, mainMemory) {
  if (activeHeads[headId]) {
    const headMemory = activeHeads[headId].memory.join('. ');
    const compressedResult = compressMemory(headMemory).compressedMemory;

    logDebug(`Pruning head: ${headId}`, { headMemory, compressedResult });

    delete activeHeads[headId]; // Remove the head after pruning
    return { updatedMainMemory: `${mainMemory} ${compressedResult}` };
  }

  logDebug(`Error: Head not found for pruning`, { headId });
  return { error: 'Head not found for pruning', headId };
}
