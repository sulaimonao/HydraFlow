// src/actions/logs_summarizer.js
import { callApiWithRetry } from "./action_caller.js";

/**
 * Summarizes logs by making an API call.
 */
export async function summarizeLogs(logs) {
  const endpoint = "https://hydra-flow.vercel.app/api/summarize-logs";

  try {
    if (!Array.isArray(logs) || logs.length === 0) {
      throw new Error("Logs must be a non-empty array.");
    }

    return await callApiWithRetry(endpoint, { logs });
  } catch (error) {
    console.error(`Error in summarizeLogs: ${error.message}`);
    throw new Error("Failed to summarize logs.");
  }
}
