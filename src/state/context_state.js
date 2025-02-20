// src/state/context_state.js (Local SQLite Version)
// Removed Supabase imports
//import { supabase, supabaseRequest } from '../lib/db.js';
import * as db from '../../lib/db.js'; // Import SQLite db module
// Removed setSessionContext import
//import { setSessionContext } from '../../lib/sessionUtils.js';
import { orchestrateContextWorkflow } from '../logic/workflow_manager.js';

class ContextState {
    constructor(user_id, chatroom_id) {
        this.user_id = user_id;
        this.chatroom_id = chatroom_id;
        this.tokenUsage = { used: 0, total: 8192 };
        this.responseLatency = 0.8;
        this.updatedAt = new Date().toISOString();
        this.data = {}; // To store other context data
    }

    /**
     * ✅ Updates token usage for the current session.
     */
    async updateTokenUsage(usedTokens) {
        this.tokenUsage.used += usedTokens;
        this.updatedAt = new Date().toISOString();

        try {
            // No need to call setSessionContext - handled by middleware
            // await setSessionContext(this.user_id, this.chatroom_id);

            // Use db.updateContext (you'll need to implement this in lib/db.js)
            await db.updateContext(this.user_id, this.chatroom_id, this);
            console.log(`📝 Token usage updated: ${this.tokenUsage.used}/${this.tokenUsage.total}`);
        } catch (error) {
            console.error('❌ Error updating token usage:', error.message);
            // Consider re-throwing the error or handling it appropriately
            throw new Error('Failed to update token usage');
        }
    }

    /**
     * ✅ Updates response latency for the current session.
     */
    async updateResponseLatency(latency) {
        this.responseLatency = latency;
        this.updatedAt = new Date().toISOString();

        try {
            // No need to call setSessionContext
            // await setSessionContext(this.user_id, this.chatroom_id);

            // Use db.updateContext
            await db.updateContext(this.user_id, this.chatroom_id, this);
            console.log(`⏱️ Response latency updated: ${this.responseLatency}s`);
        } catch (error) {
            console.error('❌ Error updating response latency:', error.message);
             throw new Error('Failed to update response latency');
        }
    }
}

let currentContext;
const contextHistory = []; // Keep this for in-memory history

/**
 * ✅ Logs context updates for traceability.
 */
export function logContextUpdate(newData) {
    console.log('📝 Context Updated:', newData);
    // Deep copy of currentContext to avoid unintended modifications
    contextHistory.push(JSON.parse(JSON.stringify({ ...currentContext, updatedAt: new Date().toISOString() })));
}

/**
 * ✅ Updates the global context state and stores it in the database.
 * @param {Object} newData - New context data to merge.
 * @param {Object} req - Request object for workflow context.
 */
export async function updateContext(newData, req) {
    console.log('🔍 Checking sessionContext middleware execution...');
    try {
        const { userId, chatroomId } = req.session;

        if (!currentContext || currentContext.user_id !== userId || currentContext.chatroom_id !== chatroomId) {
            currentContext = new ContextState(userId, chatroomId);
        }

        logContextUpdate(newData);

        // Merge newData into currentContext.data, and update other properties
        currentContext.data = { ...currentContext.data, ...newData }; // Update the data property
        currentContext.updatedAt = new Date().toISOString(); // Always update updatedAt

         // Removed setSessionContext
        //await setSessionContext(userId, chatroomId);

        // Use db.updateContext (you'll need to implement this in lib/db.js)
        // Pass the entire currentContext object (or the relevant parts)
        await db.updateContext(userId, chatroomId, currentContext);
        // Ensure that data is stored as a JSON string
        await db.insertContext(userId, chatroomId, currentContext.data);

        console.log(`🔍 req.session content: ${JSON.stringify(req.session)}`);
        console.log('✅ Context updated successfully.');
        return currentContext; // Return the updated context

    } catch (error) {
        console.error('❌ Error updating context:', error.message);
        throw new Error("Failed to update context.");
    }
}

/**
 * ✅ Retrieves the context update history for debugging.
 */
export function getContextHistory() {
    return contextHistory;
}

export { currentContext };