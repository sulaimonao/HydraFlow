// src/logic/workflow_manager.js
import {
  parseQuery,
  compressMemory,
  summarizeLogs,
  generateFinalResponse,
  collectFeedback,
} from "../actions/index.js";
import { updateContext, createTaskCard, getMemory } from "../state/index.js";
import { gatherGaugeData, shouldCompressMemory } from "./conditions.js";

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

    const { keywords, actionItems } = parseQuery(query);
    const updatedContext = { keywords, actionItems };
    await updateContext(updatedContext, user_id, chatroom_id);

    if (shouldCompressMemory(tokenCount)) {
      const existingMemory = await getMemory(user_id, chatroom_id);
      const compressed = compressMemory(existingMemory);
      response.compressedMemory = compressed;
    }

    if (logs) {
      response.logSummary = await summarizeLogs(logs);
    }

    response.finalResponse = generateFinalResponse({
      userInput: query,
      context: updatedContext,
      actionsPerformed: response,
    });

    if (feedback) {
      await collectFeedback(feedback);
    }

    return response;
  } catch (error) {
    console.error("Workflow failed:", error);
    throw new Error("Workflow orchestration failed.");
  }
};
