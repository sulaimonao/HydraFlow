// lib/contextManager.js (Local SQLite Version)
// Removed Supabase imports
//import { supabase, supabaseRequest } from './db.js';
import * as db from './db.js'; // Import SQLite db module
import { orchestrateContextWorkflow } from '../src/logic/workflow_manager.js';
import { compressMemory } from '../src/util/memoryUtils.js';
// Removed setSessionContext import
//import { setSessionContext } from '../lib/sessionUtils.js';

/**
 * Sets the user and chatroom context.  This function is simplified
 * because session management is handled by express-session.
 * @param {object} req - The request object for session tracking.
 * @returns {object} - Returns the user_id and chatroom_id if successful.
 */
export const setContext = async (req) => {
    console.log('🔍 Checking session context middleware execution...');
    try {
        // No need to fetch or upsert session. express-session + connect-sqlite3 handle this.
        // The session data (userId and chatroomId) is already available in req.session.

        if (!req.session || !req.session.userId || !req.session.chatroomId) {
          throw new Error('User ID or Chatroom ID missing from session.');
        }

        const persistentUserId = req.session.userId;
        const persistentChatroomId = req.session.chatroomId;

        console.log(`🔍 req.session content: ${JSON.stringify(req.session)}`);
        console.log(`🛠️ Session context confirmed: user_id=${persistentUserId}, chatroom_id=${persistentChatroomId}`);

        return { user_id: persistentUserId, chatroom_id: persistentChatroomId };

    } catch (err) {
        console.error("⚠️ Error in setContext:", err.message);
        throw new Error("Failed to set context.");
    }
};
/**
 * Retrieves the current context.
 * @param {object} req - The request object.
 * @returns {Promise<object>} - The current context.
 */
export const getContext = async (req) => {
    console.log('🔍 Checking sessionContext middleware execution...');
    try {
        // Validate req.session.userId
        if (!req.session || !req.session.userId) {
            console.error('❌ req.session.userId is missing or undefined.');
            throw new Error('Session tracking requires a valid user ID.');
        }
          const { userId, chatroomId } = req.session;
        // Fetch context using db.fetchContext
        const contextData = await db.fetchContext(userId, chatroomId);

        if (!contextData) {
            console.warn(`⚠️ No context found for user: ${userId}, chatroom: ${chatroomId}`);
             return null; // Or an empty object, depending on your needs
        }

        console.log('✅ Context fetched successfully:', contextData);
        // Return the parsed context data
        return JSON.parse(contextData.data); // Parse the JSON string
    } catch (err) {
        console.error('⚠️ Error in getContext:', err.message);
        throw new Error('Failed to get context.');
    }
};