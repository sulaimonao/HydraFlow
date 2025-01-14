// src/actions/action_caller.js
import axios from 'axios';
import { calculateMetrics } from "../util/metrics.js";
import { generateResponse } from './response_generator_actions.js';
import { setSessionContext } from '../../lib/supabaseClient.js';  // ✅ Ensure context is set

// 🔄 Retry logic for API calls with session context
async function callApiWithRetry(endpoint, payload, user_id, chatroom_id, retries = 3, backoff = 300) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // ✅ Set session context before making the API call
      await setSessionContext(user_id, chatroom_id);

      const response = await axios.post(endpoint, {
        ...payload,
        user_id,
        chatroom_id,  // 🔒 Ensure user and chatroom IDs are included
      });
      return response.data;
    } catch (error) {
      if (attempt < retries && shouldRetry(error)) {
        await new Promise(resolve => setTimeout(resolve, backoff * attempt));
      } else {
        console.error(`❌ API call failed after ${attempt} attempts:`, error.message);
        throw error;
      }
    }
  }
}

// 🔍 Retry logic for transient errors
function shouldRetry(error) {
  return !error.response || (error.response.status >= 500 && error.response.status < 600);
}

export { callApiWithRetry };

// 🎯 Centralized action dispatcher with persistent context
async function callAction(action, payload, context) {
  const { user_id, chatroom_id } = context;  // ✅ Extract IDs from context

  // ✅ Validate IDs are present
  if (!user_id || !chatroom_id) {
    throw new Error("Missing user_id or chatroom_id in context.");
  }

  // ✅ Set session context for security and data consistency
  await setSessionContext(user_id, chatroom_id);

  switch (action) {
    case "generate_response":
      return await generateResponse(payload, context);

    case "fetch_gauge_metrics":
      return calculateMetrics(context);

    case "compress_memory":
      // Example API call for memory compression
      return await callApiWithRetry('/api/compress-memory', payload, user_id, chatroom_id);

    case "create_subpersona":
      // Example API call for persona creation
      return await callApiWithRetry('/api/create-subpersona', payload, user_id, chatroom_id);

    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

export { callAction };
