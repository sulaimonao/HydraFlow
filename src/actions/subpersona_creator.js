// src/actions/subpersona_creator.js (Local SQLite Version)
// Removed Supabase imports
//import { supabase, supabaseRequest } from '../../lib/db.js';
import * as db from '../../lib/db.js'; // Import SQLite db module
// Removed setSessionContext import
//import { setSessionContext } from '../../lib/sessionUtils.js';
import { orchestrateContextWorkflow } from '../logic/workflow_manager.js';
// Removed unused supabase import
//import supabase from '../../lib/supabaseClient.js';

const activeHeads = {}; // Keep this for in-memory tracking (optional)

// 🔥 Predefined subpersona templates
const subpersonaTemplates = {
    logAnalyzer: {
        task: "analyze logs",
        description: "This subpersona specializes in log analysis.",
    },
    memoryOptimizer: {
        task: "optimize memory",
        description: "This subpersona specializes in memory optimization.",
    },
};

// ✅ Validate required IDs (Simplified - relies on req.session)
const validateIds = (req) => {
    if (!req.session || !req.session.userId || !req.session.chatroomId) {
        throw new Error("❗ Missing user_id or chatroom_id. Both must be provided.");
    }
};

// 🚀 Create a subpersona from a predefined template
async function createSubpersonaFromTemplate(templateName, query, req) {
    try {
        validateIds(req); // Use the simplified validation
        const { userId, chatroomId } = req.session;

        // Removed orchestrateContextWorkflow, no longer needed
        //const { generatedIdentifiers } = await orchestrateContextWorkflow({ query, req });
        //const { user_id, chatroom_id } = generatedIdentifiers;

        // No need to call setSessionContext - handled by middleware
        // await setSessionContext(userId, chatroomId);

        const template = subpersonaTemplates[templateName];
        if (!template) throw new Error(`❗ Unknown template: ${templateName}`);

        // ✅ Check if subpersona already exists using db.getHeads
        const existingHeads = await db.getHeads(userId, chatroomId);

        if (existingHeads.some(head => head.name === `Head for ${template.task}`)) {
            return { error: "⚠️ Subpersona already exists." };
        }

        // 📝 Insert subpersona into the database using db.insertHead
          // Serialize capabilities and preferences
        const capabilities = { task: template.task };
        const preferences = { description: template.description };
        const head = await db.insertHead(userId, chatroomId, `Head for ${template.task}`, capabilities, preferences);

        // Update in-memory activeHeads (optional)
        activeHeads[head.id] = {
            name: head.name,
            task_description: template.description,
            status: "active",
            memory: [] // Consider if you need this in-memory tracking
        };

        console.log(`✅ Created subpersona '${head.name}' for user ${userId}.`);
        return { headId: head.id, name: head.name, status: "active" };
    } catch (error) {
        console.error("❌ Error creating subpersona from template:", error.message);
        return { error: error.message };
    }
}

// 🟢 Activate a subpersona by head ID (Keep this for in-memory tracking, optional)
function activateSubpersona(headId) {
    if (activeHeads[headId]) {
        activeHeads[headId].status = "active";
        console.log(`✅ Subpersona ${headId} activated.`);
    } else {
        console.warn(`⚠️ Subpersona ${headId} not found.`);
    }
}

// 🔴 Deactivate a subpersona by head ID (Keep this for in-memory tracking, optional)
function deactivateSubpersona(headId) {
    if (activeHeads[headId]) {
        activeHeads[headId].status = "inactive";
        console.log(`🛑 Subpersona ${headId} deactivated.`);
    } else {
        console.warn(`⚠️ Subpersona ${headId} not found.`);
    }
}

// 🗑️ Prune (delete) a subpersona from memory and database
async function pruneHead(headId, req) { // Added req parameter
     try {
        validateIds(req);
        const { userId, chatroomId } = req.session;

        // Optional: Remove from in-memory activeHeads
        if (activeHeads[headId]) {
          delete activeHeads[headId];
        }
        // Use the validateHeadInteraction from db module.
         const existingHead = await db.validateHeadInteraction(userId, chatroomId, headId);

        if (!existingHead) {
            console.warn(`⚠️ Subpersona ${headId} not found or already pruned.`);
            return { error: "Subpersona not found or already inactive." };
          }
        // Use db.deleteHead (You'll need to implement this in lib/db.js)
        await db.deleteHead(headId, userId, chatroomId);

        console.log(`🗑️ Subpersona ${headId} has been pruned.`);
        return { success: `Subpersona ${headId} successfully pruned.` };
    } catch (error) {
        console.error(`❌ Error pruning subpersona ${headId}:`, error.message);
        return { error: `Failed to prune subpersona ${headId}.` };
    }
}

// 📋 List all active subpersonas (Keep this for in-memory tracking, optional)
function listActiveSubpersonas() {
    return Object.entries(activeHeads)
        .filter(([_, head]) => head.status === "active")
        .map(([headId, head]) => ({ headId, ...head }));
}

// 🛠️ Create a custom subpersona with user-defined parameters
export async function createSubpersona(query, name, capabilities, preferences, req) {
    try {
        // Validate and get userId and chatroomId from req.session
        validateIds(req);
        const { userId, chatroomId } = req.session;

        // No need for orchestrateContextWorkflow or setSessionContext
        // await setSessionContext(userId, chatroomId);

        // ✅ Check for existing subpersona using db.getHeads
        const existingHeads = await db.getHeads(userId, chatroomId);
        if (existingHeads.some(head => head.name === name && head.status === 'active')) { //added status check
            return { error: `⚠️ Subpersona '${name}' already exists.` };
        }

        // 📝 Insert the new subpersona using db.insertHead
        const head = await db.insertHead(userId, chatroomId, name, capabilities || {}, preferences || {});

        console.log(`✅ Subpersona '${name}' created successfully.`);
        return { message: '✅ Subpersona created successfully.', data: { id: head.id } }; // Return the ID
    } catch (error) {
        console.error('❌ Error creating subpersona:', error.message);
        return { error: error.message };
    }
}
// Added deleteHead to db.js
async function deleteHead(headId, userId, chatroomId) {
    const sql = `DELETE FROM heads WHERE id = ? AND user_id = ? AND chatroom_id = ?`;
    return promisifyDbRun(sql, [headId, userId, chatroomId]);
}

export {
    createSubpersonaFromTemplate,
    activateSubpersona,
    deactivateSubpersona,
    pruneHead,
    listActiveSubpersonas,
    deleteHead
};