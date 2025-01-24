// src/util/actionHandler.js
import { compressMemory, storeCompressedMemory } from '../actions/memory_compressor.js';
import { prioritizeTasks, limitResponses, simplifyResponses } from '../state/task_manager.js';
import { orchestrateContextWorkflow } from '../logic/workflow_manager.js';
import { setSessionContext } from '../../lib/sessionUtils.js';

/**
 * 🚀 Handles dynamic actions with session enforcement and optimized execution.
 * @param {Array<string>} actions - List of actions to execute.
 * @param {Object} context - Context object containing relevant data.
 * @param {Object} req - Request object for consistent session handling.
 * @returns {Array<string>} - Feedback on executed actions.
 */
export async function handleActions(actions, context, req) {
  const feedback = [];

  console.log('🔍 Checking sessionContext middleware execution...');
  try {
    if (!req.session || !req.session.userId || !req.session.chatroomId) {
      throw new Error("❗ Session context is missing");
    }

    // 🔒 Set session context for RLS enforcement using session data
    await setSessionContext(req.session.userId, req.session.chatroomId);

    const userId = req.session.userId;
    const chatroomId = req.session.chatroomId;
    for (const action of actions) {
      try {
        switch (action) {
          case 'compressMemory':
            const compressedMemory = compressMemory(context.memory);
            await storeCompressedMemory(userId, chatroomId, compressedMemory.compressedMemory);
            console.log("🗜️ Memory compressed and stored.");
            feedback.push("Memory usage is high. Optimizing memory for better performance.");
            break;

          case 'prioritizeTasks':
            prioritizeTasks(context.tasks);  // No need for await as it's synchronous
            console.log("📋 Tasks prioritized.");
            feedback.push("System load is high. Prioritizing high-importance tasks.");
            break;

          case 'limitResponses':
            limitResponses(context.responses);
            console.log("📉 Responses limited to manage resources.");
            feedback.push("Token usage is high. Limiting responses to manage resources efficiently.");
            break;

          case 'simplifyResponses':
            simplifyResponses(context.responses);
            console.log("🔎 Responses simplified for faster processing.");
            feedback.push("Performance issues detected. Streamlining responses for faster processing.");
            break;

          default:
            console.warn(`⚠️ Unrecognized action: ${action}`);
            feedback.push(`Unrecognized action: ${action}`);
            break;
        }
        feedback.push(`✅ Action ${action} executed successfully.`);
      } catch (actionError) {
        console.error(`❌ Error executing action '${action}':`, actionError.message);
        feedback.push(`❌ Action ${action} failed: ${actionError.message}`);
      }
    }
    console.log(`🔍 req.locals content: ${JSON.stringify(req.locals)}`);
    return feedback;
  } catch (workflowError) {
    console.error("❌ Error in handleActions workflow:", workflowError.message);
    feedback.push(`Error in handling actions: ${workflowError.message}`);
  }

  return feedback;
}
