// src/state/heads_state.js (Local SQLite Version)
// Removed Supabase imports
//import { supabase, supabaseRequest } from '../lib/db.js';
import * as db from '../../lib/db.js'; // Import SQLite db module
// Removed setSessionContext import
//import { setSessionContext } from '../../lib/sessionUtils.js';
import { orchestrateContextWorkflow } from '../logic/workflow_manager.js';

/**
 * ✅ Adds a new head entry.
 * @param {string} name - Name of the head/subpersona.
 * @param {string} status - Status of the head (active/inactive).
 * @param {Object} req - Request object for session tracking.
 * @param {string} query - Associated query for workflow tracking (not directly used, kept for consistency).
 * @returns {Object} - The newly created head data.
 */
export async function addHead(name, status, req, query) { // Keep query for consistency
    try {
        const { userId, chatroomId } = req.session;

        // 🔒 No need to set session context - handled by middleware
        // await setSessionContext(userId, chatroomId);

        // 📝 Insert new head into the 'heads' table using db.insertHead
        // Assuming capabilities and preferences are optional and can be null
        const head = await db.insertHead(userId, chatroomId, name, null, null);
        head.status = status; // Set the status (insertHead doesn't currently handle it)
        head.createdat = new Date().toISOString(); // Set createdat

        console.log(`✅ New head '${name}' added for user_id: ${userId}, chatroom_id: ${chatroomId}`);
        return head;
    } catch (error) {
        console.error('❌ Error adding head:', error.message);
        throw new Error('Failed to add head.');
    }
}

/**
 * ✅ Fetches all heads for the current user and chatroom.
 * @param {Object} req - Request object for session tracking.
 * @param {string} query - Query for workflow tracking (not directly used, kept for consistency).
 * @returns {Array} - List of heads.
 */
export async function getHeads(req, query) { // Keep query for consistency
    try {
        const { userId, chatroomId } = req.session;

        // 🔒 No need to set session context
        // await setSessionContext(userId, chatroomId);

        // 📦 Fetch heads using db.getHeads
        const heads = await db.getHeads(userId, chatroomId);

        console.log(`📂 Retrieved ${heads.length} heads for user_id: ${userId}, chatroom_id: ${chatroomId}`);
        return heads;
    } catch (error) {
        console.error('❌ Error fetching heads:', error.message);
        throw new Error('Failed to retrieve heads.');
    }
}