// Updated workflow_manager.js
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
    let updatedContext = {};
    const response = {};
    const activeHeadTasks = [];

    const { keywords, actionItems } = parseQuery(query);
    updatedContext.keywords = keywords;
    updatedContext.actionItems = actionItems;

    const taskCard = createTaskCard(query, actionItems);

    for (const action of actionItems) {
      switch (action) {
        case "summarize logs":
          if (logs) {
            const subPersona = createSubpersona("log analysis", "Summarize logs for key patterns and errors");
            const result = await summarizeLogs(logs);
            assignHeadTask(subPersona.headId, result);
            activeHeadTasks.push(subPersona.headId);
            const subtask = taskCard.subtasks.find((t) => t.task === action);
            if (subtask) subtask.status = "completed";
            response.logsSummary = result;
          }
          break;

        case "compress memory":
          if (memory.length > 1000) {
            const compressed = compressMemory(memory);
            updatedContext.memory = compressed.compressedMemory;
            const subtask = taskCard.subtasks.find((t) => t.task === action);
            if (subtask) subtask.status = "completed";
            response.compressedMemory = compressed.compressedMemory;
          }
          break;

        default:
          console.warn("Unknown action:", action);
      }
    }

    for (const headId of activeHeadTasks) {
      const { updatedMainMemory } = pruneHead(headId, updatedContext.memory);
      updatedContext.memory = updatedMainMemory;
    }

    const contextDigest = generateContextDigest(updatedContext.memory);
    response.contextDigest = contextDigest;

    const context = updateContext(updatedContext);

    const finalResponse = await generateFinalResponse({
      userInput: query,
      compressedMemory: response.compressedMemory,
      summaryReport: response.logsSummary,
      context,
      taskCard,
      actionsPerformed: response,
    });

    if (feedback) {
      const feedbackResult = collectFeedback({
        responseId: Date.now().toString(),
        userFeedback: feedback.comment,
        rating: feedback.rating,
      });
    }

    return {
      status: "context_updated",
      context,
      finalResponse,
    };
  } catch (error) {
    console.error("Error in orchestrateContextWorkflow:", error);
    throw new Error("Workflow orchestration failed.");
  }
};