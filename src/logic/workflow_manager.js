const { parseQuery } = require('../actions/query_parser');
const { compressMemory } = require('../actions/memory_compressor');
const { updateContext } = require('../state/context_state');
const { summarizeLogs } = require('../actions/logs_summarizer');
const { createSubpersona, assignHeadTask, pruneHead } = require('../actions/subpersona_creator');

// Orchestrates actions for parsing, updating context, managing memory, and handling sub-personas
function orchestrateContextWorkflow({ query, memory, logs }) {
  let updatedContext = {};
  const response = {};
  const activeHeadTasks = [];

  // Step 1: Parse query for action items and keywords
  const { keywords, actionItems } = parseQuery(query);
  console.log("Parsed Query:", { keywords, actionItems });

  updatedContext.keywords = keywords;
  updatedContext.actionItems = actionItems;

  // Step 2: Handle 'summarize logs' with a specialized head
  if (actionItems.includes("summarize logs") && logs) {
    const newHead = createSubpersona('log analysis', 'Summarize logs for key patterns and errors');
    console.log("Created Head:", newHead);

    // Perform the task and assign the results to the head
    const taskResult = summarizeLogs(logs);
    assignHeadTask(newHead.headId, taskResult);

    // Mark the head for pruning
    activeHeadTasks.push(newHead.headId);
    response.logsSummary = taskResult;
  }

  // Step 3: Compress memory if needed
  if (actionItems.includes("compress memory") || memory.length > 1000) {
    response.compressedMemory = compressMemory(memory).compressedMemory;
    updatedContext.memory = response.compressedMemory;
  } else {
    updatedContext.memory = memory;
  }

  // Step 4: Prune and compress active heads into main memory
  activeHeadTasks.forEach((headId) => {
    const { updatedMainMemory } = pruneHead(headId, updatedContext.memory);
    updatedContext.memory = updatedMainMemory;
  });

  // Step 5: Update the context state
  const context = updateContext(updatedContext);
  console.log("Updated Context:", context);

  // Step 6: Return orchestrated output
  return {
    status: "context_updated",
    context,
    actionsPerformed: response
  };
}

module.exports = { orchestrateContextWorkflow };
