// src/logic/workflow_manager.js

// Import necessary modules and utilities for workflow management
import { gatherGaugeData } from "../logic/gauge_logic.js";
import { parseQuery } from "../actions/query_parser.js";
import { compressMemory, storeCompressedMemory } from '../actions/memory_compressor.js';
import { updateContext, logContextUpdate } from "../state/context_state.js";
import { createSubpersonaFromTemplate, pruneHead } from "../actions/subpersona_creator.js";
import { createTaskCard, addDependency, updateTaskStatus } from "../state/task_manager.js";
import { generateContextDigest } from "../actions/context_digest.js";
import { generateFinalResponse } from "../actions/response_generator_actions.js";
import { collectFeedback } from "../actions/feedback_collector.js";
import { getHeads } from "../state/heads_state.js";
import { appendMemory, getMemory, storeProjectData } from "../state/memory_state.js";
import { logIssue } from "../../api/debug.js";
import { v4 as uuidv4 } from 'uuid';  // UUID for consistent ID handling
import { calculateMetrics } from '../util/metrics.js';
import { handleActions } from '../util/actionHandler.js';
import { shouldCompress, needsContextRecap, shouldCreateHead } from "./conditions.js";
import supabase from '../../lib/supabaseClient.js';

/**
 * Orchestrates the entire context workflow.
 * Handles memory updates, task execution, and response generation.
 */
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

    // === System-Wide UUID Enforcement ===
    const generatedUserId = user_id || uuidv4();      // Generate UUID if missing
    const generatedChatroomId = chatroom_id || uuidv4();

    response.generatedIdentifiers = {
      user_id: generatedUserId,
      chatroom_id: generatedChatroomId,
    };

    // === Retrieve Existing Memory and Heads ===
    const existingMemory = await getMemory(generatedUserId, generatedChatroomId);
    const heads = await getHeads(generatedUserId, generatedChatroomId);

    // === Log Workflow Start ===
    await logIssue({
      userId: generatedUserId,
      contextId: generatedChatroomId,
      issue: 'Workflow started',
      resolution: `Query: ${query}`,
    });

    // === Parse Query for Actionable Items ===
    const { keywords, actionItems } = parseQuery(query);
    updatedContext.keywords = keywords || [];
    updatedContext.actionItems = actionItems || [];

    // === Update Memory with New Query ===
    const updatedMemory = await appendMemory(query, generatedUserId, generatedChatroomId);
    updatedContext.memory = updatedMemory;

    // === Create and Resolve Task Dependencies ===
    const taskCard = createTaskCard(query, actionItems);
    await resolveDependencies(taskCard, generatedUserId, generatedChatroomId);

    // === Conditional Memory Compression ===
    if (shouldCompress(actionItems, existingMemory.length)) {
      const compressed = compressMemory(existingMemory);
      await storeCompressedMemory(generatedUserId, generatedChatroomId, compressed);
      updatedContext.memory = compressed;
      response.compressedMemory = compressed;
    }

    // === Subpersona Creation if Needed ===
    if (shouldCreateHead(actionItems)) {
      const newHead = await createSubpersonaFromTemplate("workflow_optimizer", generatedUserId, generatedChatroomId);
      updatedContext.newHead = newHead;
      response.newHead = newHead;
    }

    // === Store Workflow Data ===
    await storeProjectData(generatedUserId, generatedChatroomId, query);

    // === Prune Inactive Heads ===
    for (const head of heads) {
      await pruneHead(head.id);
    }

    // === Log Context Updates ===
    logContextUpdate(updatedContext);
    const context = await updateContext(updatedContext);

    // === Generate Context Digest ===
    response.contextDigest = generateContextDigest(updatedContext.memory);

    // === Gather Gauge Metrics ===
    response.gaugeData = await gatherGaugeData({
      user_id: generatedUserId,
      chatroom_id: generatedChatroomId,
    });

    // === Metrics Calculation for Action Decision ===
    const metrics = calculateMetrics(context);
    const actions = metrics.actions;

    // === Dynamic Action Injection Based on Metrics ===
    if (shouldCompress(actions, memory.length)) {
      actions.push('compressMemory');
    }

    if (needsContextRecap(memory.length, feedback.engagement)) {
      actions.push('contextRecap');
    }

    // === Execute Dynamic Actions ===
    const actionFeedback = await handleActions(actions, context);

    // === Final Response Generation ===
    response.finalResponse = await generateFinalResponse({
      userInput: query,
      compressedMemory: response.compressedMemory,
      context,
      taskCard,
      actionsPerformed: response,
      gaugeData: response.gaugeData,
      actionFeedback,
    });

    // === Trigger Feedback Prompt if Task is Completed ===
    if (taskCard.status === "completed") {
      response.feedbackPrompt = {
        message: "How was the workflow? Please provide your feedback (e.g., 'Great job! 5').",
        hint: "Feedback and rating (1-5)",
      };
    }

    // === Store User Feedback if Provided ===
    if (feedback) {
      await collectFeedback({
        responseId: Date.now().toString(),
        userFeedback: feedback.comment,
        rating: feedback.rating,
      });
    }

    // === Log Workflow Completion ===
    await logIssue({
      userId: generatedUserId,
      contextId: generatedChatroomId,
      issue: 'Workflow completed successfully',
      resolution: `Final response: ${response.finalResponse}`,
    });

    // === Return Workflow Results ===
    return {
      status: "context_updated",
      context,
      finalResponse: response.finalResponse,
      feedbackPrompt: response.feedbackPrompt || null,
      generatedIdentifiers: response.generatedIdentifiers,
    };
  } catch (error) {
    console.error("Error in orchestrateContextWorkflow:", error);

    // === Error Logging for Debugging ===
    await logIssue({
      userId: user_id,
      contextId: chatroom_id,
      issue: 'Workflow orchestration failed',
      resolution: `Error: ${error.message}`,
    });

    throw new Error("Workflow orchestration failed.");
  }
};

/**
 * Resolves dependencies for each subtask in the task card.
 */
async function resolveDependencies(taskCard, user_id, chatroom_id) {
  for (const subtask of taskCard.subtasks) {
    if (subtask.dependencies && subtask.dependencies.length > 0) {
      const unresolved = subtask.dependencies.filter((dep) => !dep.resolved);
      if (unresolved.length > 0) continue;
    }
    await updateTaskStatus(subtask.id, "in_progress", user_id, chatroom_id);
  }
}
