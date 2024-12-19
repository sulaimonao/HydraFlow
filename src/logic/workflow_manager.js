import { parseQuery } from "../actions/query_parser.js";
import { compressMemory } from "../actions/memory_compressor.js";
import { updateContext } from "../state/context_state.js";
import { summarizeLogs } from "../actions/logs_summarizer.js";
import { createSubpersona, assignHeadTask, pruneHead } from "../actions/subpersona_creator.js";
import { createTaskCard, addDependency, getTaskCard } from "../state/task_manager.js";

export const orchestrateContextWorkflow = ({ query, memory, logs }) => {
  let updatedContext = {};
  const response = {};
  const activeHeadTasks = [];

  // Step 1: Parse query for action items and keywords
  const { keywords, actionItems } = parseQuery(query);
  console.log("Parsed Query:", { keywords, actionItems });

  updatedContext.keywords = keywords;
  updatedContext.actionItems = actionItems;

  // Step 2: Generate Task Card
  const taskCard = createTaskCard(query, actionItems);
  console.log("Generated Task Card:", taskCard);

  // Step 3: Handle 'summarize logs' task
  if (actionItems.includes("summarize logs") && logs) {
    const newHead = createSubpersona(
      "log analysis",
      "Summarize logs for key patterns and errors"
    );
    console.log("Created Head:", newHead);

    // Perform the task and assign the results to the head
    const taskResult = summarizeLogs(logs);
    assignHeadTask(newHead.headId, taskResult);

    // Mark the head for pruning
    activeHeadTasks.push(newHead.headId);
    response.logsSummary = taskResult;

    // Update the Task Card
    taskCard.subtasks.find((t) => t.task === "summarize logs").status = "completed";
  }

  // Step 4: Compress memory if needed
  if (actionItems.includes("compress memory") || memory.length > 1000) {
    response.compressedMemory = compressMemory(memory).compressedMemory;
    updatedContext.memory = response.compressedMemory;

    // Update Task Card for memory compression
    taskCard.subtasks.find((t) => t.task === "compress memory").status = "completed";
  } else {
    updatedContext.memory = memory;
  }

  // Step 5: Prune and compress active heads into main memory
  activeHeadTasks.forEach((headId) => {
    const { updatedMainMemory } = pruneHead(headId, updatedContext.memory);
    updatedContext.memory = updatedMainMemory;
  });

  // Step 6: Update the context state
  const context = updateContext(updatedContext);
  console.log("Updated Context:", context);

  // Step 7: Return orchestrated output
  return {
    status: "context_updated",
    context,
    taskCard, // Include the Task Card for tracking
    actionsPerformed: response,
  };
};
