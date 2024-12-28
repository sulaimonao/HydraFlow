// src/logic/workflow_manager.js

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
import { getHeads } from "../state/heads_state.js";
import { appendMemory, getMemory } from "../state/memory_state.js";

/** 
 * IMPORT the new condition checks we just added:
 */
import {
  shouldCompressMemory,
  canCreateNewHead,
} from "./conditions.js";

/**
 * UPDATED orchestrateContextWorkflow
 * 
 * Now accepts an optional `tokenCount` parameter for memory compression decisions.
 * Also checks head count to see if new sub-personas can be created safely.
 */
export const orchestrateContextWorkflow = async ({
  query,
  memory,
  logs,
  feedback,
  user_id,
  chatroom_id,
  /** new optional param for token usage */
  tokenCount = 0,
}) => {
  try {
    const response = {};
    const activeHeadTasks = [];
    const updatedContext = {};

    // Retrieve memory and heads from the database
    const existingMemory = await getMemory(user_id, chatroom_id);
    const heads = await getHeads(user_id, chatroom_id);
    const headCount = heads.length; // how many sub-personas currently exist

    // Parse the query
    const { keywords, actionItems } = parseQuery(query);
    updatedContext.keywords = keywords || [];
    updatedContext.actionItems = actionItems || [];

    // Append the query to memory
    const updatedMemory = await appendMemory(query, user_id, chatroom_id);
    updatedContext.memory = updatedMemory;

    // Create a task card
    const taskCard = createTaskCard(query, actionItems);

    // === GAUGE CHECKS (NEW) ===
    // 1) If token usage is above our limit, compress memory automatically
    if (shouldCompressMemory(tokenCount) && existingMemory && existingMemory.length > 1000) {
      const compressed = compressMemory(existingMemory);
      updatedContext.memory = compressed.compressedMemory;
      response.compressedDueToTokens = true;
      // Mark a subtask if relevant
      const compressSubtask = taskCard.subtasks.find((t) => t.task === "compress memory");
      if (compressSubtask) {
        compressSubtask.status = "completed";
      }
      response.compressedMemory = compressed.compressedMemory;
    }

    // 2) If the user wants to create a new sub-persona, 
    //    check if we haven't reached the max heads limit
    //    (Your existing code might handle sub-persona creation automatically, but 
    //     here's an example of how you'd incorporate canCreateNewHead() if relevant.)
    if (actionItems.includes("create-subpersona")) {
      if (!canCreateNewHead(headCount)) {
        response.headLimitReached = true;
        // We can skip creating sub-persona, or give a warning
        console.warn("Max heads limit reached. Cannot create a new sub-persona.");
      }
      // else continue with creation in the taskHandlers block (below)
    }

    // Task Handlers (existing)
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
        // Original condition if memory is too large
        if (existingMemory && existingMemory.length > 1000) {
          const compressed = compressMemory(existingMemory);
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

    // Generate the context digest, update context
    response.contextDigest = generateContextDigest(updatedContext.memory);
    const context = updateContext(updatedContext);

    // Finalize response for the user
    response.finalResponse = await generateFinalResponse({
      userInput: query,
      compressedMemory: response.compressedMemory,
      summaryReport: response.logsSummary,
      context,
      taskCard,
      actionsPerformed: response,
    });

    // Prompt for feedback after task completion
    if (taskCard && taskCard.status === "completed") {
      response.feedbackPrompt = {
        message: "How was the workflow? Please provide your feedback (e.g., 'Great job! 5').",
        hint: "Feedback and rating (1-5)",
      };
    }

    // Collect feedback if provided
    if (feedback) {
      await collectFeedback({
        responseId: Date.now().toString(),
        userFeedback: feedback.comment,
        rating: feedback.rating,
      });
    }

    return {
      status: "context_updated",
      context,
      finalResponse: response.finalResponse,
      feedbackPrompt: response.feedbackPrompt || null,
    };
  } catch (error) {
    console.error("Error in orchestrateContextWorkflow:", error);
    throw new Error("Workflow orchestration failed.");
  }
};
