// src/state/memory_state.js (Local SQLite Version)
// Removed Supabase imports
//import { supabase, supabaseRequest } from '../lib/db.js';
import * as db from '../../lib/db.js'; // Import SQLite db module
// Removed setSessionContext import
//import { setSessionContext } from '../../lib/sessionUtils.js';
import { orchestrateContextWorkflow } from '../logic/workflow_manager.js';

// Removed the global memory variable.  Memory will be stored in the database.
// let memory = "";

/**
 * ✅ Appends new memory and persists it in the database.
 * @param {string} newMemory - The memory content to append.
 * @param {string} existingMemory - The existing memory content
 * @param {Object} req - Request object for session tracking.
 * @param {string} query - The associated query. (Kept for consistency, but unused)
 * @returns {string} - Updated memory.
 */
export async function appendMemory(newMemory, existingMemory, req, query) { //Added existingMemory parameter
    try {
        if (!req.session || !req.session.userId || !req.session.chatroomId) {
            throw new Error("❗ Session context is missing");
        }

        // 🌐 Retrieve persistent IDs
        const userId = req.session.userId;
        const chatroomId = req.session.chatroomId;

        // 🔒 No need to set session context
        // await setSessionContext(userId, chatroomId);

        // 📝 Append new memory to existing memory
        const updatedMemory = existingMemory + " " + newMemory; // Space for separation

        // 📦 Use db.updateMemory (handles both insert and update)
        await db.updateMemory(userId, chatroomId, updatedMemory);


        console.log(`✅ Memory updated for user_id: ${userId}, chatroom_id: ${chatroomId}`);
        return updatedMemory; // Return the updated memory string
    } catch (error) {
        console.error('❌ Error appending memory:', error);
        throw error; // Re-throw the error to be handled by the caller
    }
}

/**
 * ✅ Stores project data in the 'memories' table.
 * @param {string} query - Associated query. (Kept for consistency, but unused)
 * @param {Object} req - Request object for session tracking.
 * @param {string | object} projectData - Project-specific memory data.
 */
export async function storeProjectData(query, req, projectData) { //Changed order of parameters
    try {
        // 🌐 Retrieve persistent IDs
        const { userId, chatroomId } = req.session;

        // 🔒 No need to set session context
        // await setSessionContext(userId, chatroomId);
        const projectDataString = typeof projectData === 'string' ? projectData : JSON.stringify(projectData);
        // 📦 Insert project data using db.updateMemory (handles insert and update)
        await db.updateMemory(userId, chatroomId, projectDataString);

        console.log(`✅ Project data stored for user_id: ${userId}, chatroom_id: ${chatroomId}`);
    } catch (error) {
        console.error('❌ Error storing project data:', error);
        throw error; // Re-throw the error
    }
}

/**
 * ✅ Retrieves memory for the user and chatroom.
 * @param {Object} req - Request object for session tracking.
 * @param {string} query - Associated query (kept for consistency, unused).
 * @returns {string} - Retrieved memory or an empty string.
 */
export async function getMemory(req, query) { // Keep query parameter for consistency
    try {
        // 🌐 Retrieve persistent IDs
        const { userId, chatroomId } = req.session;

        // 🔒 No need to set session context
        // await setSessionContext(userId, chatroomId);

        // 📦 Fetch memory from the database using db.fetchMemory
        const memoryData = await db.fetchMemory(userId, chatroomId);
         // Return the memory string, or an empty string if no memory is found
        return memoryData ? memoryData.memory : "";

    } catch (error) {
        console.error('❌ Error retrieving memory:', error);
        return ""; // Return empty string on error
    }
}