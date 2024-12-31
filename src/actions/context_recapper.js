// src/actions/context_recapper.js

import { callApiWithRetry } from './action_caller.mjs';

/**
 * Summarizes the context history and combines it with compressed memory.
 *
 * @param {Array} history - The conversation or task history to be recapped.
 * @param {string} compressedMemory - Compressed memory to enrich the recap, if available.
 * @returns {Promise<Object>} - The API response containing the recapped context.
 */
export async function contextRecap(history, compressedMemory = "") {
  const endpoint = 'https://hydra-flow.vercel.app/api/context-recap';

  try {
    const payload = {
      history: JSON.stringify(history), // Serialize history for API compatibility
      compressedMemory // Default value for robustness
    };

    const response = await callApiWithRetry(endpoint, payload);
    return response; // Return the recapped context for further use
  } catch (error) {
    console.error(`Error in contextRecap: ${error.message}`);
    throw new Error(`Failed to generate context recap: ${error.message}`);
  }
}
