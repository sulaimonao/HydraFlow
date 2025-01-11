// src/logic/workflow_manager.js
import { gatherGaugeData } from "../logic/gauge_logic.js";
import { parseQuery } from "../actions/query_parser.js";
import { compressMemory, storeCompressedMemory } from '../actions/memory_compressor.js';
import { updateContext, logContextUpdate } from "../state/context_state.js";
import { createSubpersona, pruneHead } from "../actions/subpersona_creator.js";
import { createTaskCard, addDependency, updateTaskStatus } from "../state/task_manager.js"; // Correct path
import { generateContextDigest } from "../actions/context_digest.js";
import { generateFinalResponse } from "../actions/response_generator_actions.js";
import { collectFeedback } from "../actions/feedback_collector.js";
import { getHeads } from "../state/heads_state.js";
import { appendMemory, getMemory, storeProjectData } from "../state/memory_state.js";
import { logIssue } from "../../api/debug.js";
import { v4 as uuidv4 } from 'uuid';
import { calculateMetrics } from '../util/metrics.js';
import { handleActions } from '../util/actionHandler.js';
import { shouldCompress, needsContextRecap, shouldCreateHead } from "./conditions.js";
import supabase from '../lib/supabaseClient.js';

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
    if (shouldCompress(actionItems, existingMemory.length)) {
      const compressed = compressMemory(existingMemory);
      await storeCompressedMemory(generatedUserId, generatedChatroomId, compressed);
      updatedContext.memory = compressed;
      response.compressedMemory = compressed;
    }

    // Check if a new head should be created
    if (shouldCreateHead(actionItems)) {
      const newHead = await createSubpersona(query, "New head created for specific task", generatedUserId, generatedChatroomId);
      updatedContext.newHead = newHead;
      response.newHead = newHead;
    }

    // Store project data
    await storeProjectData(generatedUserId, generatedChatroomId, query);

    // Prune sub-personas if necessary
    for (const head of heads) {
      const { updatedMainMemory } = pruneHead(head.id, updatedContext.memory);
      updatedContext.memory = updatedMainMemory;
    }

    // Update context and generate context digest
    logContextUpdate(updatedContext);
    const context = await updateContext(updatedContext);
    response.contextDigest = generateContextDigest(updatedContext.memory);

    // Gather gauge data
    response.gaugeData = await gatherGaugeData({ user_id: generatedUserId, chatroom_id: generatedChatroomId });

    // Calculate metrics and determine actions
    const metrics = calculateMetrics(context);
    const actions = metrics.actions;

    // Check conditions before handling actions
    if (shouldCompress(actions, memory.length)) {
      actions.push('compressMemory');
    }

    if (needsContextRecap(memory.length, feedback.engagement)) {
      actions.push('contextRecap');
    }

    // Handle actions and get user feedback
    const actionFeedback = await handleActions(actions, context);

    // Final user-facing response
    response.finalResponse = await generateFinalResponse({
      userInput: query,
      compressedMemory: response.compressedMemory,
      context,
      taskCard,
      actionsPerformed: response,
      gaugeData: response.gaugeData,
      actionFeedback, // Include action feedback
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


