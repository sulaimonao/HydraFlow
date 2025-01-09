//src/actions/subpersona_creator.js

import { compressMemory } from './memory_compressor.js';
import { v4 as uuidv4 } from 'uuid';
import { insertHead } from '../lib/db.js';

const activeHeads = {}; // Store active heads temporarily

// Create a specialized sub-persona for a task
async function createSubpersona(task, description) {
  const headId = `head_${uuidv4()}`;
  const name = `Head for ${task}`;
  const user_id = uuidv4();
  const chatroom_id = uuidv4();

  console.log('Creating sub-persona with:', { name, user_id, chatroom_id });

  try {
    const head = await insertHead({
      name,
      capabilities: { task },
      preferences: { description },
      user_id,
      chatroom_id
    });

    activeHeads[headId] = {
      name: head.name,
      task_description: description,
      status: "active",
      memory: []
    };

    console.log('Sub-persona created successfully:', head);
    return { headId, name: head.name, status: "active" };
  } catch (error) {
    console.error('Failed to create sub-persona:', error.message);
    return { error: "Failed to create sub-persona", details: error.message };
  }
}

// Assign task results to a head
function assignHeadTask(headId, taskResult) {
  if (activeHeads[headId]) {
    activeHeads[headId].memory.push(taskResult);
    return { status: "updated", headId, taskResult };
  }
  return { error: "Head not found", headId };
}

// Prune a head and merge its results back into main memory
function pruneHead(headId, mainMemory) {
  if (activeHeads[headId]) {
    const headMemory = activeHeads[headId].memory.join(". ");
    const compressedResult = compressMemory(headMemory).compressedMemory;

    delete activeHeads[headId]; // Remove the head after pruning
    return { updatedMainMemory: mainMemory + ` ${compressedResult}` };
  }
  return { error: "Head not found for pruning", headId };
}

export { createSubpersona, assignHeadTask, pruneHead };
