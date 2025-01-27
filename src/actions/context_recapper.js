// src/actions/context_recapper.js
import { callApiWithRetry } from './action_caller.js';
import { setSessionContext } from '../../lib/sessionUtils.js';
const logger = require('../util/logger');

/**
 * Generates a context recap by summarizing history and updating the backend.
 * @param {Array} history - The conversation history.
 * @param {string} compressedMemory - Compressed memory snapshot.
 * @param {string} user_id - User ID for session context.
 * @param {string} chatroom_id - Chatroom ID for session context.
 * @returns {Promise<Object>} - API response or error.
 */
export async function contextRecap(history, compressedMemory, req) {
  console.log('🔍 Checking sessionContext middleware execution...');
  try {
    const endpoint = 'https://hydra-flow.vercel.app/api/context-recap';

    // ✅ Validate essential identifiers
    if (!user_id || !chatroom_id) {
      throw new Error("❌ Missing user_id or chatroom_id for context recap.");
    }

    const { userId: user_id, chatroomId: chatroom_id } = req.session;

    // 🔒 Set Supabase session context for RLS enforcement
    await setSessionContext(user_id, chatroom_id);
    // 📝 Summarize history for more efficient recap
    const summarizedHistory = summarizeHistory(history);
    // 📦 Prepare payload with context identifiers
    const payload = {
      user_id,             // ✅ Include user ID
      chatroom_id,         // ✅ Include chatroom ID
      history: JSON.stringify(summarizedHistory),
      compressedMemory: compressedMemory || "",
    };

    // ⚠️ Validate payload before API call
    const isValid = validateContextRecap(payload);
    if (!isValid) {
      throw new Error("❌ Invalid context recap payload.");
    }

    // 🚀 Make API call with retries
    const response = await callApiWithRetry(endpoint, payload, user_id, chatroom_id);

    console.log(`🔍 req.session content: ${JSON.stringify(req.session)}`);
    console.log(`✅ Context recap completed for user_id: ${user_id}, chatroom_id: ${chatroom_id}`);
    return response;

  } catch (error) {
    logger.error('Error in contextRecap', { error, context: { history, compressedMemory, req } });
    console.error("❌ Error in contextRecap:", error.message);
    throw new Error(`Context recap failed: ${error.message}`);
  }
}

/**
 * Summarizes the conversation history.
 * @param {Array} history - Conversation history.
 * @returns {Array} - Condensed version of history.
 */
function summarizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history.slice(-5);  // 📌 Return the last 5 entries
}

/**
 * Validates the context recap payload.
 * @param {Object} payload - Data sent to the API.
 * @returns {boolean} - Validation result.
 */
function validateContextRecap(payload) {
  return (
    payload &&
    typeof payload.history === 'string' &&
    payload.compressedMemory !== undefined &&
    payload.user_id &&
    payload.chatroom_id
  );
}

function recapContext(context) {
  try {
    // existing code
  } catch (error) {
    logger.error('Error in recapContext', { error, context });
    throw error;
  }
}

module.exports = recapContext;
