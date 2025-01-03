// src/actions/context_recapper.js
import { callApiWithRetry } from "./action_caller.js";

/**
 * Summarizes context history and combines it with compressed memory.
 */
export async function contextRecap(history, compressedMemory = "") {
  const endpoint = "https://hydra-flow.vercel.app/api/context-recap";

  try {
    const payload = {
      history: JSON.stringify(history),
      compressedMemory,
    };

    return await callApiWithRetry(endpoint, payload);
  } catch (error) {
    console.error(`Error in contextRecap: ${error.message}`);
    throw new Error("Failed to generate context recap.");
  }
}
