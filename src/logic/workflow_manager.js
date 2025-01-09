// src/logic/workflow_manager.js
import { gatherGaugeData } from "../logic/gauge_logic.js";
import { parseQuery } from "../actions/query_parser.js";
import { compressMemory } from "../logic/memory_compressor.js";
import { updateContext, logContextUpdate } from "../state/context_state.js";
import { createSubpersona, pruneHead } from "../actions/subpersona_creator.js";
import { createTaskCard, addDependency, updateTaskStatus } from "../state/task_manager.js";
import { generateContextDigest } from "../logic/context_digest.js";
import { generateFinalResponse } from "../logic/response_generator.js";
import { collectFeedback } from "../logic/feedback_collector.js";
import { getHeads } from "../state/heads_state.js";
import { appendMemory, getMemory } from "../state/memory_state.js";
import { logIssue } from "../../api/debug.js"; // Import logIssue function
import { v4 as uuidv4 } from 'uuid'; // Import UUID library

import { shouldCompressMemory, canCreateNewHead } from "./conditions.js";

// Orchestrates the entire workflow
export const orchestrateContextWorkflow = async ({
  query,
  memory,
  feedback,
  user_id,
  chatroom_id,
  tokenCount = 0,
}) => {
  try {
    const response = {};
    const updatedContext = {};

    // Generate user_id and chatroom_id if not provided
    const generatedUserId = user_id || uuidv4();
    const generatedChatroomId = chatroom_id || uuidv4();

    response.generatedIdentifiers = {
      user_id: generatedUserId,
      chatroom_id: generatedChatroomId,
    };

    // Retrieve memory and heads
    const existingMemory = await getMemory(generatedUserId, generatedChatroomId);
    const heads = await getHeads(generatedUserId, generatedChatroomId);
    const headCount = heads.length;

    // Log the start of the workflow
    await logIssue({
      userId: generatedUserId,
      contextId: generatedChatroomId,
      issue: 'Workflow started',
      resolution: `Query: ${query}`,
    });

    // Parse query
    const { keywords, actionItems } = parseQuery(query);
    updatedContext.keywords = keywords || [];
    updatedContext.actionItems = actionItems || [];

    // Append query to memory
    const updatedMemory = await appendMemory(query, generatedUserId, generatedChatroomId);
    updatedContext.memory = updatedMemory;

    // Create task card
    const taskCard = createTaskCard(query, actionItems);

    // Resolve dependencies
    await resolveDependencies(taskCard, generatedUserId, generatedChatroomId);

    // Handle memory compression
    if (shouldCompressMemory(tokenCount) && existingMemory?.length > 1000) {
      const compressed = compressMemory(existingMemory);
      updatedContext.memory = compressed.compressedMemory;
      response.compressedMemory = compressed.compressedMemory;
    }

    // Prune sub-personas if necessary
    for (const head of heads) {
      const { updatedMainMemory } = pruneHead(head.id, updatedContext.memory);
      updatedContext.memory = updatedMainMemory;
    }

    // Check if sub-persona creation is required
    if (actionItems.includes("create-subpersona")) {
      const subpersona = await createSubpersona(query, "Sub-persona created for specific task", generatedUserId, generatedChatroomId);
      updatedContext.subpersona = subpersona;
      response.subpersona = subpersona;
    }

    // Update context and generate context digest
    logContextUpdate(updatedContext);
    const context = await updateContext(updatedContext);
    response.contextDigest = generateContextDigest(updatedContext.memory);

    // Gather gauge data
    response.gaugeData = await gatherGaugeData({ user_id: generatedUserId, chatroom_id: generatedChatroomId });

    // Final user-facing response
    response.finalResponse = await generateFinalResponse({
      userInput: query,
      compressedMemory: response.compressedMemory,
      context,
      taskCard,
      actionsPerformed: response,
      gaugeData: response.gaugeData,
    });

    // Prompt for feedback
    if (taskCard.status === "completed") {
      response.feedbackPrompt = {
        message: "How was the workflow? Please provide your feedback (e.g., 'Great job! 5').",
        hint: "Feedback and rating (1-5)",
      };
    }

    // Handle feedback submission
    if (feedback) {
      await collectFeedback({
        responseId: Date.now().toString(),
        userFeedback: feedback.comment,
        rating: feedback.rating,
      });
    }

    // Log the successful completion of the workflow
    await logIssue({
      userId: generatedUserId,
      contextId: generatedChatroomId,
      issue: 'Workflow completed successfully',
      resolution: `Final response: ${response.finalResponse}`,
    });

    return {
      status: "context_updated",
      context,
      finalResponse: response.finalResponse,
      feedbackPrompt: response.feedbackPrompt || null,
      generatedIdentifiers: response.generatedIdentifiers,
    };
  } catch (error) {
    console.error("Error in orchestrateContextWorkflow:", error);

    // Log the error
    await logIssue({
      userId: generatedUserId,
      contextId: generatedChatroomId,
      issue: 'Workflow orchestration failed',
      resolution: `Error: ${error.message}`,
    });

    throw new Error("Workflow orchestration failed.");
  }
};

// Resolve dependencies for a task card
async function resolveDependencies(taskCard, user_id, chatroom_id) {
  for (const subtask of taskCard.subtasks) {
    if (subtask.dependencies && subtask.dependencies.length > 0) {
      const unresolved = subtask.dependencies.filter((dep) => !dep.resolved);
      if (unresolved.length > 0) {
        console.warn(`Unresolved dependencies for subtask ${subtask.description}:`, unresolved);
        continue;
      }
    }
    await updateTaskStatus(subtask.id, "in_progress", user_id, chatroom_id);
    console.log(`Subtask ${subtask.description} is now in progress.`);
  }
}
