// src/util/actionHandler.js (Local SQLite Version)
import { compressMemory, storeCompressedMemory } from '../actions/memory_compressor.js';
import { prioritizeTasks, limitResponses, simplifyResponses } from '../state/task_manager.js';
import { orchestrateContextWorkflow } from '../logic/workflow_manager.js';
// Removed setSessionContext import
//import { setSessionContext } from '../../lib/sessionUtils.js';

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

        // 🔒 No need to set session context - handled by middleware
        // await setSessionContext(req.session.userId, req.session.chatroomId);

        const { userId, chatroomId } = req.session; // Destructure for easier access

        for (const action of actions) {
            try {
                switch (action) {
                    case 'compressMemory':
                    case 'compress-memory':
                        // Assuming compressMemory returns an object with a compressedMemory property
                        const compressed = compressMemory(context.memory); // Pass context.memory
                        if(compressed.error){
                          throw new Error(compressed.error);
                        }
                        await storeCompressedMemory(req, compressed.compressedMemory); // Pass req
                        console.log("🗜️ Memory compressed and stored.");
                        feedback.push("Memory usage is high. Optimizing memory for better performance.");
                        break;

                    case 'prioritizeTasks':
                        // Assuming context.tasks exists and is an array of tasks
                        if (context.tasks && Array.isArray(context.tasks)) {
                            prioritizeTasks(context.tasks);  // No need for await as it's synchronous
                            console.log("📋 Tasks prioritized.");
                            feedback.push("System load is high. Prioritizing high-importance tasks.");
                        } else {
                            console.warn("⚠️ No tasks found in context for prioritization.");
                            feedback.push("No tasks found to prioritize.");
                        }
                        break;

                    case 'limitResponses':
                        // Assuming context.responses exists and is an array
                        if (context.responses && Array.isArray(context.responses)) {
                          limitResponses(context.responses);
                          console.log("📉 Responses limited to manage resources.");
                          feedback.push("Token usage is high. Limiting responses to manage resources efficiently.");
                        }
                        else {
                          console.warn("⚠️ No responses found in context to limit.");
                          feedback.push("No responses to limit");
                        }
                        break;
                    case 'simplifyResponses':
                        // Assuming context.responses exists and is an array
                        if (context.responses && Array.isArray(context.responses)) {
                            simplifyResponses(context.responses);
                            console.log("🔎 Responses simplified for faster processing.");
                            feedback.push("Performance issues detected. Streamlining responses for faster processing.");
                        } else {
                            console.warn("⚠️ No responses found in context to simplify.");
                            feedback.push("No responses to simplify.");
                        }
                        break;
                    // Added more cases for actions
                    case 'summarize-logs':
                        feedback.push('Log summarization not implemented yet.');
                        break;
                    case 'create-subpersona':
                         feedback.push('Subpersona creation not implemented yet.');
                        break;
                    case 'fetch-gauge-metrics':
                        feedback.push('Gauge metrics fetching not implemented yet.');
                        break;
                    case 'generate-report':
                         feedback.push('Report generation not implemented yet.');
                        break;
                    case 'analyze-feedback':
                         feedback.push('Feedback analysis not implemented yet.');
                        break;
                    case 'clear-history':
                        feedback.push('History clearing not implemented yet.');
                        break;
                    case 'update-context':
                        feedback.push('Context updating not implemented yet.');
                        break;
                    default:
                        console.warn(`⚠️ Unrecognized action: ${action}`);
                        feedback.push(`Unrecognized action: ${action}`);
                        break;
                }
                // No need to push a generic success message - individual cases handle feedback
                // feedback.push(`✅ Action ${action} executed successfully.`);
            } catch (actionError) {
                console.error(`❌ Error executing action '${action}':`, actionError.message);
                feedback.push(`❌ Action ${action} failed: ${actionError.message}`);
            }
        }
        console.log(`🔍 req.session content: ${JSON.stringify(req.session)}`);
        return feedback;
    } catch (workflowError) {
        console.error("❌ Error in handleActions workflow:", workflowError.message);
        feedback.push(`Error in handling actions: ${workflowError.message}`);
    }

    return feedback; // Ensure feedback is always returned
}

// Export callAction if it's defined elsewhere and needed
// export { callAction }; // Uncomment if you have a callAction function