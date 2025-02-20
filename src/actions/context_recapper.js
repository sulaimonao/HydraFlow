// src/actions/context_recapper.js (Local SQLite Version)
import { callApiWithRetry } from './action_caller.js';
// Removed setSessionContext import
//import { setSessionContext } from '../../lib/sessionUtils.js';
const logger = require('../util/logger');

/**
 * Generates a context recap by summarizing history and updating the backend.
 * @param {Array} history - The conversation history.
 * @param {string} compressedMemory - Compressed memory snapshot.
 * @param {object} req - The request object, containing session data.
 * @returns {Promise<Object>} - API response or error.
 */
export async function contextRecap(history, compressedMemory, req) {
    console.log('🔍 Checking sessionContext middleware execution...');
    try {
        // ✅ Validate essential identifiers (Simplified)
        if (!req.session || !req.session.userId || !req.session.chatroomId) {
          throw new Error("❌ Missing user_id or chatroom_id for context recap.");
        }

        const { userId, chatroomId } = req.session;

        // 🔒 No need to set session context - handled by middleware
        // await setSessionContext(userId, chatroomId);

        // 📝 Summarize history for more efficient recap
        const summarizedHistory = summarizeHistory(history);

        // 📦 Prepare payload (Simplified - no need to include user_id, chatroom_id)
        const payload = {
            history: JSON.stringify(summarizedHistory),
            compressedMemory: compressedMemory || "",
        };

        // ⚠️ Validate payload before API call
        const isValid = validateContextRecap(payload); // Simplified validation
        if (!isValid) {
            throw new Error("❌ Invalid context recap payload.");
        }

        // 🚀 Make API call with retries (using relative path)
        const response = await callApiWithRetry('/api/context-recap', payload, req);


        console.log(`🔍 req.session content: ${JSON.stringify(req.session)}`);
        console.log(`✅ Context recap completed for user_id: ${userId}, chatroom_id: ${chatroomId}`);
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
        payload.compressedMemory !== undefined
        // Removed user_id and chatroom_id checks
    );
}

// Keep this function, in case you use this function in other files
async function recapContext(context) {
  try {
    // You can leave the existing code here, even though recapContext is called no where
  } catch (error) {
    logger.error('Error in recapContext', { error, context });
    throw error;
  }
}

export { recapContext, contextRecap }; // Export contextRecap