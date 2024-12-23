// context-recapper.js
import { callApiWithRetry } from './action_caller.mjs';

export async function contextRecap(history, compressedMemory) {
  const endpoint = 'https://hydra-flow.vercel.app/api/context-recap';
  const payload = {
    history: JSON.stringify(history), // Serialize history for consistency
    compressedMemory: compressedMemory || "" // Default value for robustness
  };
  return callApiWithRetry(endpoint, payload);
}
