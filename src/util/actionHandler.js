// src/util/actionHandler.js
import { compressMemory, storeCompressedMemory } from '../actions/memory_compressor.js';
import { prioritizeTasks, limitResponses, simplifyResponses } from '../state/task_manager.js';
import { orchestrateContextWorkflow } from '../logic/workflow_manager.js';
import { setSessionContext } from '../../lib/supabaseClient.js';

/**
 * Handles dynamic actions by ensuring consistent ID usage and optimized task execution.
 */
export async function handleActions(actions, context) {
  const feedback = [];

  // Retrieve consistent user and chatroom IDs
  const { generatedIdentifiers } = await orchestrateContextWorkflow({ req, query: context.query });
  const { user_id, chatroom_id } = generatedIdentifiers;

  // Enforce session context for Supabase
  await setSessionContext(user_id, chatroom_id);

  for (const action of actions) {
    switch (action) {
      case 'compressMemory':
        const compressedMemory = compressMemory(context.memory);
        await storeCompressedMemory(user_id, chatroom_id, compressedMemory.compressedMemory);
        feedback.push("Memory usage is high. Optimizing memory for better performance.");
        break;

      case 'prioritizeTasks':
        await prioritizeTasks(context.tasks);  // Assuming tasks are passed in context
        feedback.push("System load is high. Prioritizing high-importance tasks.");
        break;

      case 'limitResponses':
        await limitResponses(context.responses);  // Assuming responses are passed in context
        feedback.push("Token usage is high. Limiting responses to manage resources efficiently.");
        break;

      case 'simplifyResponses':
        await simplifyResponses(context.responses);  // Assuming responses are passed in context
        feedback.push("Performance issues detected. Streamlining responses for faster processing.");
        break;

      default:
        console.warn(`⚠️ Unrecognized action: ${action}`);
        feedback.push(`Unrecognized action: ${action}`);
        break;
    }
  }

  return feedback;
}
