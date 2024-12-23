// workflow_manager.js
import { parseQuery } from "../actions/query_parser.js";
import { compressMemory } from "../actions/memory_compressor.js";
import { updateContext } from "../state/context_state.js";
import { summarizeLogs } from "../actions/logs_summarizer.js";
import {
  createSubpersona,
  assignHeadTask,
  pruneHead,
} from "../actions/subpersona_creator.js";
import { createTaskCard } from "../state/task_manager.js";
import { generateContextDigest } from "../actions/context_digest.js";
import { generateFinalResponse } from "../actions/response_generator.js";
import { collectFeedback } from "../actions/feedback_collector.js";

export const orchestrateContextWorkflow = async ({ query, memory, logs, feedback }) => {
  try {
    const response = {};
    const activeHeadTasks = [];
    const updatedContext = {};

    // Parse the query
    const { keywords, actionItems } = parseQuery(query);
    updatedContext.keywords = keywords || [];
    updatedContext.actionItems = actionItems || [];

    // Create a task card
    const taskCard = createTaskCard(query, actionItems);

    // Task Handlers
    const taskHandlers = {
      "summarize logs": async () => {
        if (logs) {
          const subPersona = createSubpersona("log analysis", "Summarize logs for key patterns and errors");
          const result = await summarizeLogs(logs);
          assignHeadTask(subPersona.headId, result);
          activeHeadTasks.push(subPersona.headId);

          // Update task card status
          taskCard.subtasks.find((t) => t.task === "summarize logs").status = "completed";
          response.logsSummary = result;
        }
      },
      "compress memory": async () => {
        if (memory && memory.length > 1000) {
          const compressed = compressMemory(memory);
          updatedContext.memory = compressed.compressedMemory;
          taskCard.subtasks.find((t) => t.task === "compress memory").status = "completed";
          response.compressedMemory = compressed.compressedMemory;
        }
      },
      default: async (action) => {
        console.warn(`Unhandled action: ${action}`);
        response.unhandledActions = response.unhandledActions || [];
        response.unhandledActions.push(action);
      },
    };

    // Execute tasks
    for (const action of actionItems) {
      if (taskHandlers[action]) {
        await taskHandlers[action]();
      } else {
        await taskHandlers.default(action);
      }
    }

    // Prune sub-personas and finalize context
    for (const headId of activeHeadTasks) {
      const { updatedMainMemory } = pruneHead(headId, updatedContext.memory);
      updatedContext.memory = updatedMainMemory;
    }

    response.contextDigest = generateContextDigest(updatedContext.memory);
    const context = updateContext(updatedContext);

    // Finalize response
    response.finalResponse = await generateFinalResponse({
      userInput: query,
      compressedMemory: response.compressedMemory,
      summaryReport: response.logsSummary,
      context,
      taskCard,
      actionsPerformed: response,
    });

    // Collect feedback
    if (feedback) {
      collectFeedback({
        responseId: Date.now().toString(),
        userFeedback: feedback.comment,
        rating: feedback.rating,
      });
    }

    return {
      status: "context_updated",
      context,
      finalResponse: response.finalResponse,
    };
  } catch (error) {
    console.error("Error in orchestrateContextWorkflow:", error);
    throw new Error("Workflow orchestration failed.");
  }
};
