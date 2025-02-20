// src/actions/logs_summarizer.js (Local SQLite Version)
import { callApiWithRetry } from './action_caller.js';
// Removed setSessionContext import
//import { setSessionContext } from '../../lib/sessionUtils.js';

/**
 * ✅ Summarize logs.
 * @param {Array|string} logs - Logs to summarize.
 * @param {object} req - The request object, containing session data.
 * @returns {Promise<Object>} Summarized logs response.
 */
async function summarizeLogs(logs, req) {
    try {
        // 🔒 Validate user and chatroom context (Simplified)
        if (!req.session || !req.session.userId || !req.session.chatroomId) {
            throw new Error("Missing user_id or chatroom_id for log summarization.");
        }

        const { userId, chatroomId } = req.session;

        // 🔐 No need to set session context - handled by middleware
        // await setSessionContext(userId, chatroomId);

        // 📦 Prepare the payload (Simplified - no need to include user_id, chatroom_id)
        const payload = {
            logs: Array.isArray(logs) ? logs : [logs],  // Ensure logs are in array format
        };

        const endpoint = '/api/summarize-logs'; // Use relative path

        // 🚀 Execute API call with retry logic
        const response = await callApiWithRetry(endpoint, payload, req);

        console.log(`✅ Logs summarized for user_id: ${userId}, chatroom_id: ${chatroomId}`);
        return response;

    } catch (error) {
        console.error(`❌ Error in summarizeLogs: ${error.message}`);
        throw new Error(`Failed to summarize logs: ${error.message}`);
    }
}

export { summarizeLogs };