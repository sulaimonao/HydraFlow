// src/actions/context_recapper.js

import { callApiWithRetry } from './action_caller.js';

export async function contextRecap(history, compressedMemory) {
  const endpoint = 'https://hydra-flow.vercel.app/api/context-recap';
  const payload = {
    history: JSON.stringify(history), // Serialize history for consistency
    compressedMemory: compressedMemory || "" // Default value for robustness
  };

  // Automated summarization
  const summarizedHistory = summarizeHistory(history);
  payload.history = JSON.stringify(summarizedHistory);

  // Context validation
  const isValid = validateContextRecap(payload);
  if (!isValid) {
    throw new Error("Invalid context recap.");
  }

  return callApiWithRetry(endpoint, payload);
}

function summarizeHistory(history) {
  // Implement summarization logic here
  return history.slice(0, 5); // Example: Include the first 5 entries
}

function validateContextRecap(contextRecap) {
  // Implement validation logic here
  return contextRecap.history && contextRecap.compressedMemory;
}
