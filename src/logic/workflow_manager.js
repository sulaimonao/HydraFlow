// src/logic/workflow_manager.js

import { parseQuery, compressMemory, generateContextDigest,
   generateFinalResponse, collectFeedback,
   createSubpersona,
   assignHeadTask,
   pruneHead,
   summarizeLogs, } from "../actions/index";
import { updateContext, createTaskCard, getHeads,
  appendMemory, getMemory
 } from "../state/index";
import { gatherGaugeData } from "./index";
import {
  shouldCompressMemory,
  canCreateNewHead,
} from "./index";

/**
 * Orchestrates the entire workflow:
 *  - parse query
 *  - execute tasks
 *  - update memory & context
 *  - gather final gauge data for self-awareness
 */
export const orchestrateContextWorkflow = async ({
  query,
  memory,
  logs,
  feedback,
  user_id,
  chatroom_id,
  tokenCount = 0,
}) => {
  try {
    const response = {};
    const activeHeadTasks = [];
    const updatedContext = {};

    // Retrieve memory and heads from the DB
    const existingMemory = await getMemory(user_id, chatroom_id);
    const heads = await getHeads(user_id, chatroom_id);
    const headCount = heads.length;

    // Parse the query
    const { keywords, actionItems } = parseQuery(query);
    updatedContext.keywords = keywords || [];
    updatedContext.actionItems = actionItems || [];

    // Append the user query to memory
    const updatedMemory = await appendMemory(query, user_id, chatroom_id);
    updatedContext.memory = updatedMemory;

    // Create a task card
    const taskCard = createTaskCard(query, actionItems);

    // === GAUGE-LIKE CHECKS ===
    // 1) If token usage is above limit, auto-compress memory
    if (shouldCompressMemory(tokenCount) && existingMemory && existingMemory.length > 1000) {
      const compressed = compressMemory(existingMemory);
      updatedContext.memory = compressed.compressedMemory;
      response.compressedDueToTokens = true;

      // Mark compress subtask if it exists
      const compressSubtask = taskCard.subtasks.find((t) => t.task === "compress memory");
      if (compressSubtask) {
        compressSubtask.status = "completed";
      }
      response.compressedMemory = compressed.compressedMemory;
    }

    // 2) If user wants to create-subpersona, check max heads
    if (actionItems.includes("create-subpersona")) {
      if (!canCreateNewHead(headCount)) {
        response.headLimitReached = true;
        console.warn("Max heads limit reached. Cannot create a new sub-persona.");
      }
    }

    // === TASK HANDLERS ===
    const taskHandlers = {
      "summarize logs": async () => {
        if (logs) {
          const subPersona = createSubpersona("log analysis", "Summarize logs for key patterns and errors");
          const result = await summarizeLogs(logs);
          assignHeadTask(subPersona.headId, result);
          activeHeadTasks.push(subPersona.headId);

          // Mark subtask as completed
          taskCard.subtasks.find((t) => t.task === "summarize logs").status = "completed";
          response.logsSummary = result;
        }
      },
      "compress memory": async () => {
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

    // Execute the tasks
    for (const action of actionItems) {
      if (taskHandlers[action]) {
        await taskHandlers[action]();
      } else {
        await taskHandlers.default(action);
      }
    }

    // Prune sub-personas if any
    for (const headId of activeHeadTasks) {
      const { updatedMainMemory } = pruneHead(headId, updatedContext.memory);
      updatedContext.memory = updatedMainMemory;
    }

    // Generate a context digest & finalize the updated context
    response.contextDigest = generateContextDigest(updatedContext.memory);
    const context = updateContext(updatedContext);

    // === GATHER GAUGE DATA FOR SELF-AWARENESS ===
    const gaugeData = await gatherGaugeData({ user_id, chatroom_id });
    response.gaugeData = gaugeData;

    // === Final user-facing response ===
    response.finalResponse = await generateFinalResponse({
      userInput: query,
      compressedMemory: response.compressedMemory,
      summaryReport: response.logsSummary,
      context,
      taskCard,
      actionsPerformed: response,
      gaugeData, // pass the gauge data to be displayed
    });

    // Prompt for feedback if done
    if (taskCard && taskCard.status === "completed") {
      response.feedbackPrompt = {
        message: "How was the workflow? Please provide your feedback (e.g., 'Great job! 5').",
        hint: "Feedback and rating (1-5)",
      };
    }

    // If user gave feedback, store it
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
