// src/actions/logs_summarizer.js

import { callApiWithRetry } from './index';

/**
 * Summarizes logs by making an API call to the specified endpoint.
 *
 * @param {Array} logs - The logs to be summarized.
 * @returns {Promise<Object>} - The API response containing the summarized logs.
 */
export async function summarizeLogs(logs) {
  const endpoint = 'https://hydra-flow.vercel.app/api/summarize-logs';

  try {
    if (!Array.isArray(logs) || logs.length === 0) {
      throw new Error("Logs must be a non-empty array.");
    }

    const payload = { logs };

    const response = await callApiWithRetry(endpoint, payload);
    return response; // Return summarized logs for further use
  } catch (error) {
    console.error(`Error in summarizeLogs: ${error.message}`);
    throw new Error(`Failed to summarize logs: ${error.message}`);
  }
}
