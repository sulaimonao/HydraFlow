import { compressMemory } from '../actions/memory_compressor.js';
import { prioritizeTasks, limitResponses, simplifyResponses } from '../actions/task_manager.js';

export async function handleActions(actions, context) {
  const feedback = [];

  for (const action of actions) {
    switch (action) {
      case 'compressMemory':
        await compressMemory(context.memory);
        feedback.push("Memory usage is high, optimizing memory to maintain performance.");
        break;
      case 'prioritizeTasks':
        await prioritizeTasks();
        feedback.push("The system is under heavy load. Focusing on high-priority tasks to ensure responsiveness.");
        break;
      case 'limitResponses':
        await limitResponses();
        feedback.push("Token usage is near capacity. Would you like to compress memory or pause less important tasks?");
        break;
      case 'simplifyResponses':
        await simplifyResponses();
        feedback.push("Experiencing some delays. Providing streamlined responses for faster interaction.");
        break;
      default:
        break;
    }
  }

  return feedback;
}