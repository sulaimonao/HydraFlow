// src/actions/log_summarizer.js
import { callApiWithRetry } from './action_caller.js';
import { setSessionContext } from '../../lib/supabaseClient.js';

/**
 * ✅ Summarize logs with persistent user and chatroom context.
 * @param {Array|string} logs - Logs to summarize.
 * @param {string} user_id - User ID for context.
 * @param {string} chatroom_id - Chatroom ID for context.
 * @returns {Promise<Object>} Summarized logs response.
 */
async function summarizeLogs(logs, user_id, chatroom_id) {
  try {
    // 🔒 Validate user and chatroom context
    if (!user_id || !chatroom_id) {
      throw new Error("Missing user_id or chatroom_id for log summarization.");
    }

    // 🔐 Set Supabase session context for RLS enforcement
    await setSessionContext(user_id, chatroom_id);

    // 📦 Prepare the payload with context
    const payload = {
      logs: Array.isArray(logs) ? logs : [logs],  // Ensure logs are in array format
      user_id,
      chatroom_id,
    };

    const endpoint = 'https://hydra-flow.vercel.app/api/summarize-logs';

    // 🚀 Execute API call with retry logic
    const response = await callApiWithRetry(endpoint, payload);

    console.log(`✅ Logs summarized for user_id: ${user_id}, chatroom_id: ${chatroom_id}`);
    return response;

  } catch (error) {
    console.error(`❌ Error in summarizeLogs: ${error.message}`);
    throw new Error(`Failed to summarize logs: ${error.message}`);
  }
}

export { summarizeLogs };
