const { compressMemory } = require('./memory_compressor');

const activeHeads = {}; // Store active heads temporarily

// Create a specialized sub-persona for a task
function createSubpersona(task, description) {
  const headId = `head_${Date.now()}`;
  activeHeads[headId] = {
    name: `Head for ${task}`,
    task_description: description,
    status: "active",
    memory: []
  };
  return { headId, name: activeHeads[headId].name, status: "active" };
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

module.exports = { createSubpersona, assignHeadTask, pruneHead };
