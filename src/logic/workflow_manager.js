import { parseQuery } from "../actions/query_parser.js";
import { compressMemory } from "../actions/memory_compressor.js";
import { updateContext } from "../state/context_state.js";
import { summarizeLogs } from "../actions/logs_summarizer.js";
import {
  createSubpersona,
  assignHeadTask,
  pruneHead,
} from "../actions/subpersona_creator.js";
import { createTaskCard, addDependency, getTaskCard } from "../state/task_manager.js";

export const orchestrateContextWorkflow = async ({ query, memory, logs }) => {
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

  // Step 3: Execute Tasks
  for (const action of actionItems) {
    switch (action) {
      case "summarize logs":
        if (logs) {
          const subPersona = createSubpersona(
            "log analysis",
            "Summarize logs for key patterns and errors"
          );
          console.log("Created Sub-Persona:", subPersona);

          // Perform the task
          const result = summarizeLogs(logs);
          assignHeadTask(subPersona.headId, result);
          activeHeadTasks.push(subPersona.headId);

          // Update Task Card
          const subtask = taskCard.subtasks.find((t) => t.task === action);
          if (subtask) subtask.status = "completed";
          response.logsSummary = result;
        }
        break;

      case "compress memory":
        if (memory.length > 1000) {
          const compressed = compressMemory(memory);
          updatedContext.memory = compressed.compressedMemory;

          // Update Task Card
          const subtask = taskCard.subtasks.find((t) => t.task === action);
          if (subtask) subtask.status = "completed";
          response.compressedMemory = compressed.compressedMemory;
        }
        break;

      case "create sub-persona":
        const persona = createSubpersona(
          "custom task",
          "Handle specialized user requests dynamically"
        );
        console.log("Created Sub-Persona:", persona);

        // Update Task Card
        const subtask = taskCard.subtasks.find((t) => t.task === action);
        if (subtask) subtask.status = "in progress";
        break;

      default:
        console.warn("Unknown action:", action);
    }
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
    taskCard,
    actionsPerformed: response,
  };
};
