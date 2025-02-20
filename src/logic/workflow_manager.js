// src/logic/workflow_manager.js (Local SQLite Version)
import { gatherGaugeData } from '../logic/gauge_logic.js';
import { parseQuery } from '../actions/query_parser.js';
import { compressMemory, storeCompressedMemory } from '../actions/memory_compressor.js';
import { updateContext, logContextUpdate } from '../state/context_state.js'; // Still Supabase-dependent!
import { createSubpersonaFromTemplate, pruneHead } from '../actions/subpersona_creator.js';
import { createTaskCard, addDependency, updateTaskStatus } from '../state/task_manager.js';  // Still Supabase-dependent!
import { generateContextDigest } from '../actions/context_digest.js';
import { generateFinalResponse } from '../actions/response_generator_actions.js';
import { collectFeedback } from '../actions/feedback_collector.js';
import { getHeads } from '../state/heads_state.js'; // Still Supabase-dependent!
import { appendMemory, getMemory, storeProjectData } from '../state/memory_state.js'; // Still Supabase-dependent!
import { logIssue } from '../../api/debug.js'; // Modified in previous steps
import { v4 as uuidv4, validate as validateUUID } from 'uuid';
import { calculateMetrics } from '../util/metrics.js';
import { handleActions, callAction } from '../util/actionHandler.js'; // Assuming actionHandler.js exists
import { shouldCompress, needsContextRecap, shouldCreateHead } from './conditions.js';

/**
 * 🚀 Orchestrates the entire context workflow:
 * - Handles memory updates
 * - Executes dynamic actions
 * - Generates final user response
 */
export const orchestrateContextWorkflow = async (req, input = {
    query: '', // Provide default values for input
    memory: '',
    feedback: null,
    tokenCount: 0
}) => { // Add req parameter
    console.log('🔍 Checking sessionContext middleware execution...');
    try {
        const { query, memory, feedback, tokenCount } = input; // Destructure input
        const response = {};
        const updatedContext = {};


        // === 🛡️ Session Validation ===
        // Simplified - rely on req.session
        if (!req.session || !req.session.userId || !req.session.chatroomId) {
            throw new Error("Invalid session IDs for user or chatroom.");
        }
        const generatedUserId = req.session.userId;
        const generatedChatroomId = req.session.chatroomId;

        response.generatedIdentifiers = { user_id: generatedUserId, chatroom_id: generatedChatroomId };

        // === 🔍 Retrieve Memory and Active Subpersonas ===
        // Assuming getMemory and getHeads have been updated to use db.js
        const { existingMemory, heads } = await Promise.all([
          getMemory(req),  // Pass req
          getHeads(generatedUserId, generatedChatroomId) // Pass IDs
        ]);

        // === 📝 Log Workflow Start ===
        // Assuming logIssue has been updated to use db.js
        await db.logIssue(generatedUserId, generatedChatroomId, 'Workflow started', `Query: ${query}`);


        // === 🧠 Query Parsing ===
        // Pass req to parseQuery
        const { keywords, actionItems, taskCard: suggestedTaskCard } = parseQuery(query, req); // Get suggested task card
        updatedContext.keywords = keywords || [];
        updatedContext.actionItems = actionItems || [];


        // === 🗃️ Memory Update ===
        // Assuming appendMemory has been updated
        const updatedMemory = await appendMemory(query, existingMemory, req); // Pass req
        updatedContext.memory = updatedMemory;

        // === 📋 Task Card Creation ===
        // Use the suggested task card from parseQuery, if available
        let taskCard = suggestedTaskCard;
        if (!taskCard) {
          taskCard = await createTaskCard(query, actionItems, req); // Pass req, and modify createTaskCard
        }


        // === 🔗 Add Dependencies ===
        // Assuming addDependency has been updated
        if (taskCard && taskCard.subtasks) { // Check if taskCard and subtasks exist
            for (const subtask of taskCard.subtasks) {
                if (subtask.dependencies && Array.isArray(subtask.dependencies)) {
                    for (const dependency of subtask.dependencies) {
                        // Assuming addDependency can now handle subtask.id and dependency.id
                        await addDependency(req, subtask.id, dependency.id); //Modify addDependency
                    }
                }
            }
        }

        // === 🔄 Update Task Status ===
         // Assuming updateTaskStatus has been updated
        if (taskCard && taskCard.subtasks) {
          for (const subtask of taskCard.subtasks) {
            // Assuming that updateTaskStatus takes the subtask ID and status
            await updateTaskStatus(req, subtask.id, subtask.status); // Modify updateTaskStatus
          }
        }

        // === 🗜️ Conditional Memory Compression ===
        if (shouldCompress(actionItems, updatedMemory.length, query, req)) { // Pass query and req
            const compressed = compressMemory(updatedMemory);
            // Assuming storeCompressedMemory has been updated
            await storeCompressedMemory(req, compressed.compressedMemory); // Pass req
            updatedContext.memory = compressed.compressedMemory; // Store compressed string
            response.compressedMemory = compressed.compressedMemory;
        }

        // === 🧩 Dynamic Subpersona Creation ===
        if (shouldCreateHead(actionItems, query, req)) { // Pass query and req
            const newHead = await createSubpersonaFromTemplate("logAnalyzer", query, req);  // Example template, pass req
             if(!newHead.error){ // Check if an error occurred
                updatedContext.newHead = newHead;
                response.newHead = newHead;
             }
        }

        // === 🗑️ Prune Inactive Subpersonas ===
        // Assuming pruneHead has been updated
        if (heads && Array.isArray(heads)) { // Check if 'heads' exists and is an array
          for (const head of heads) {
            await pruneHead(head.id, req); // Pass req
          }
        }

        // === 🔄 Context Update ===
        // Assuming updateContext has been updated
        // You'll likely need to adapt updateContext to work with SQLite
        const context = await updateContext(updatedContext, req); // Pass req
        // logContextUpdate likely doesn't need changes if it just logs
        logContextUpdate(context);

        // === 📝 Generate Context Digest ===
        // Assuming generateContextDigest has been updated
        response.contextDigest = await generateContextDigest(context.memory, req); // Pass req

        // === 📊 Gauge Metrics Collection ===
         // Assuming gatherGaugeData has been updated
        response.gaugeData = await gatherGaugeData(req); // Pass req


        // === 📈 Metrics Evaluation ===
        // Assuming calculateMetrics has been updated
        const metrics = calculateMetrics(context);
        const actions = metrics.actions || []; // Ensure actions is an array

        // === ⚡ Dynamic Action Injection ===
        // Use the updated shouldCompress and needsContextRecap, passing req
        if (shouldCompress(actions, updatedContext.memory.length, query, req)) {
            actions.push('compressMemory');
        }
        if (needsContextRecap(updatedContext.memory.length, feedback?.engagement, query, req)) {
            actions.push('contextRecap');
        }

        // === 🔄 Execute Dynamic Actions ===
        // Assuming handleActions (or callAction) is updated
        const actionFeedback = await handleActions(actions, context, req); // Pass req

        // === 📬 Collect Feedback ===
        if (feedback) {
          // Assuming collectFeedback has been updated
          await collectFeedback({
                responseId: '', // You might need to generate a response ID
                userFeedback: feedback, // Directly using the feedback
                rating: 5, // Provide rating.
                }, req); //Pass the req object

        }

        // === 📢 Generate Final User Response ===
        // Assuming generateFinalResponse has been updated
        response.finalResponse = await generateFinalResponse({
            userInput: query,
            compressedMemory: response.compressedMemory,
            context,
            taskCard,
            actionsPerformed: actionFeedback, // Pass the actionFeedback
            gaugeMetrics: response.gaugeData, // Use gaugeData from the response
        }, req); // Pass req

        // === 🗄️ Store Workflow Data ===
        // Assuming storeProjectData has been updated
        await storeProjectData(query, req, context); // Pass req

        console.log(`🔍 req.session content: ${JSON.stringify(req.session)}`);
        return response;
    } catch (error) {
        console.error("❌ Error in orchestrateContextWorkflow:", error.message);
        // Assuming logIssue has been updated
        await db.logIssue(req.session?.userId, req.session?.chatroomId, 'Workflow orchestration failed', `Error: ${error.message}`);
        throw new Error("Failed to orchestrate context workflow.");
    }
};