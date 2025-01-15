// src/logic/workflow_manager.js
// Import necessary modules and utilities for workflow management
import { gatherGaugeData } from "../src/logic/gauge_logic.js";
import { parseQuery } from "../src/actions/query_parser.js";
import { resolveDependencies } from "../src/state/task_manager.js";
import { compressMemory, storeCompressedMemory } from '../src/actions/memory_compressor.js';
import { updateContext, logContextUpdate } from "../src/state/context_state.js";
import { createSubpersonaFromTemplate, pruneHead } from "../src/actions/subpersona_creator.js";
import { createTaskCard, addDependency, updateTaskStatus } from "../src/state/task_manager.js";
import { generateContextDigest } from "../src/actions/context_digest.js";
import { generateFinalResponse } from "../src/actions/response_generator.js";
import { collectFeedback } from "../src/actions/feedback_collector.js";
import { getHeads } from "../src/state/heads_state.js";
import { appendMemory, getMemory, storeProjectData } from "../src/state/memory_state.js";
import { logIssue } from "../../api/debug.js";
import { v4 as uuidv4, validate as validateUUID } from 'uuid';
import { calculateMetrics } from '../src/util/metrics.js';
import { handleActions } from '../src/util/actionHandler.js';
import { shouldCompress, needsContextRecap, shouldCreateHead } from "./conditions.js";
import { createSession, setSessionContext } from '../../lib/supabaseClient.js';

/**
 * 🚀 Orchestrates the entire context workflow:
 * - Handles memory updates
 * - Executes dynamic actions
 * - Generates final user response
 */
export const orchestrateContextWorkflow = async (req, {
  query,
  memory,
  feedback,
  tokenCount = 0,
}) => {
  try {
    const response = {};
    const updatedContext = {};

    // === 🛡️ Session Validation ===
    const generatedUserId = req.userId;
    const generatedChatroomId = req.chatroomId;

    if (!validateUUID(generatedUserId) || !validateUUID(generatedChatroomId)) {
      throw new Error("Invalid session IDs for user or chatroom.");
    }

    response.generatedIdentifiers = {
      user_id: generatedUserId,
      chatroom_id: generatedChatroomId,
    };

    // ✅ Initialize Session Context
    await createSession(generatedUserId, generatedChatroomId);
    await setSessionContext(generatedUserId, generatedChatroomId);

    // === 🔍 Retrieve Memory and Active Subpersonas ===
    const existingMemory = await getMemory(generatedUserId, generatedChatroomId);
    const heads = await getHeads(generatedUserId, generatedChatroomId);

    // === 📝 Log Workflow Start ===
    await logIssue({
      userId: generatedUserId,
      contextId: generatedChatroomId,
      issue: 'Workflow started',
      resolution: `Query: ${query}`,
    });

    // === 🧠 Query Parsing ===
    const { keywords, actionItems } = parseQuery(query);
    updatedContext.keywords = keywords || [];
    updatedContext.actionItems = actionItems || [];

    // === 🗃️ Memory Update ===
    const updatedMemory = await appendMemory(query, generatedUserId, generatedChatroomId);
    updatedContext.memory = updatedMemory;

    // === 📋 Task Card Creation ===
    const taskCard = createTaskCard(query, actionItems);
    await resolveDependencies(taskCard, generatedUserId, generatedChatroomId);

    // === 🗜️ Conditional Memory Compression ===
    if (shouldCompress(actionItems, existingMemory.length)) {
      const compressed = compressMemory(existingMemory);
      await storeCompressedMemory(generatedUserId, generatedChatroomId, compressed);
      updatedContext.memory = compressed;
      response.compressedMemory = compressed;
    }

    // === 🧩 Dynamic Subpersona Creation ===
    if (shouldCreateHead(actionItems)) {
      const newHead = await createSubpersonaFromTemplate("workflow_optimizer", generatedUserId, generatedChatroomId);
      updatedContext.newHead = newHead;
      response.newHead = newHead;
    }

    // === 🗄️ Store Workflow Data ===
    await storeProjectData(generatedUserId, generatedChatroomId, query);

    // === 🗑️ Prune Inactive Subpersonas ===
    for (const head of heads) {
      await pruneHead(head.id);
    }

    // === 🔄 Context Update ===
    logContextUpdate(updatedContext);
    const context = await updateContext(updatedContext);

    // === 📝 Generate Context Digest ===
    response.contextDigest = generateContextDigest(updatedContext.memory);

    // === 📊 Gauge Metrics Collection ===
    response.gaugeData = await gatherGaugeData({
      user_id: generatedUserId,
      chatroom_id: generatedChatroomId,
    });

    // === 📈 Metrics Evaluation ===
    const metrics = calculateMetrics(context);
    const actions = metrics.actions;

    // === ⚡ Dynamic Action Injection ===
    if (shouldCompress(actions, memory.length)) {
      actions.push('compressMemory');
    }
    if (needsContextRecap(memory.length, feedback?.engagement)) {
      actions.push('contextRecap');
    }

    // === 🔄 Execute Dynamic Actions ===
    const actionFeedback = await handleActions(actions, context);

    // === 📬 Collect Feedback ===
    if (feedback) {
      await collectFeedback({
        user_id: generatedUserId,
        chatroom_id: generatedChatroomId,
        feedback: feedback.comment,
        rating: feedback.rating,
      });
    }

    // === 📢 Generate Final User Response ===
    response.finalResponse = await generateFinalResponse({
      userInput: query,
      compressedMemory: response.compressedMemory,
      context,
      taskCard,
      actionsPerformed: response,
      gaugeData: response.gaugeData,
      actionFeedback,
    });

    // === 💬 Prompt for Feedback if Task is Completed ===
    if (taskCard.status === "completed") {
      response.feedbackPrompt = {
        message: "How was the workflow? Please provide your feedback.",
      };
    }

    return {
      status: "context_updated",
      context,
      finalResponse: response.finalResponse,
      feedbackPrompt: response.feedbackPrompt || null,
      generatedIdentifiers: response.generatedIdentifiers,
    };
  } catch (error) {
    console.error("❌ Error in orchestrateContextWorkflow:", error);

    await logIssue({
      userId: req.userId,
      contextId: req.chatroomId,
      issue: 'Workflow orchestration failed',
      resolution: `Error: ${error.message}`,
    });

    throw new Error("Workflow orchestration failed.");
  }
};
