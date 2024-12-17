import { addUserMessage, addAssistantMessage } from './src/state/memory_state.js';
import { processUserInput } from './src/logic/workflow_manager.js';

async function handleUserInput(userInput) {
  addUserMessage(userInput);
  const response = await processUserInput(userInput);
  addAssistantMessage(response);
  return response;
}

// Example usage
(async () => {
  const userMessage = "Summarize the logs and create a head for deep analysis.";
  const reply = await handleUserInput(userMessage);
  console.log("Assistant:", reply);
})();
