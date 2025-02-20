// api/autonomous.js (Local SQLite Version)
import express from 'express';
import { orchestrateContextWorkflow } from '../src/logic/workflow_manager.js';
// Removed supabaseRequest import
// import { supabase, supabaseRequest } from '../lib/db.js';
import * as db from '../lib/db.js'; // Import the SQLite db module
import { sessionContext } from '../middleware/sessionContext.js';

const router = express.Router();

router.post('/', sessionContext, async (req, res) => {
    try {
        const { query, memory, feedback } = req.body;

        // ✅ Validate required input for query
        if (!query || typeof query !== "object") {
            return res.status(400).json({ error: "Invalid or missing query object." });
        }

        const { userId, chatroomId } = req.session;

        // 🚀 Initialize workflow
        const workflowContext = await orchestrateContextWorkflow(req, {
            query: query || '',
            memory: memory || '',
            feedback: feedback || null,
            tokenCount: req.body.tokenCount || 0,
        });

        // ✅ Dynamic action handling
        let actionResult;
        if (query.action && typeof query.action === "string") {
            switch (query.action) {
                case 'updateContext':
                    // Pass userId and chatroomId directly to updateContext
                    actionResult = await updateContext(query.data, userId, chatroomId);
                    break;
                case 'fetchData':
                     // Pass userId and chatroomId directly to fetchData
                    actionResult = await fetchData(query.data, userId, chatroomId);
                    break;
                default:
                    return res.status(400).json({ error: `Invalid action: ${query.action}` });
            }
        } else {
            actionResult = workflowContext; // Reuse initial workflow result
        }

        // ✅ Attach gauge metrics to response
        const responsePayload = {
            message: "Workflow executed successfully",
            ...actionResult,
            gaugeMetrics: res.locals.gaugeMetrics || {},
        };

        console.log(`✅ Workflow completed for user: ${userId}, chatroom: ${chatroomId}`);

        // ✅ Send successful response
        res.status(200).json(responsePayload);

    } catch (error) {
        console.error("❌ Error in autonomous workflow:", error);
        res.status(500).json({
            error: "Failed to execute workflow. Please try again.",
            details: error.message,
        });
    }
});

// ✅ Handles context updates
async function updateContext(data, userId, chatroomId) {
    try {
        console.log('🔍 Checking sessionContext middleware execution...');
        // Serialize data to a JSON string before storing
        const dataString = JSON.stringify(data);
        // Insert context using the new insertContext function
        const result = await db.insertContext(userId, chatroomId, data);
        console.log(`🔍 req.session content: ${JSON.stringify(req.session)}`);

        return { updatedContext: {  userId, chatroomId, ...data, id: result.id } };
    } catch (error) {
        console.error("⚠️ Error updating context:", error.message);
        throw new Error("Failed to update context.");
    }
}

// ✅ Handles data fetching
async function fetchData(data, userId, chatroomId) {
    try {
          // Fetch context using a hypothetical getContext function (you'll need to add this to db.js)
        const contextData = await db.fetchContext(userId, chatroomId); // Assume fetchContext exists
         if (!contextData) {
            return { data: null }; // Or handle appropriately if context is not found
        }
         // Parse the data string back into an object
        const parsedData = JSON.parse(contextData.data);

        return { data: parsedData }; // Return the parsed data
    } catch (error) {
        console.error("⚠️ Error fetching data:", error.message);
        throw new Error("Failed to fetch data.");
    }
}
// Add fetch context function
async function fetchContext(userId, chatroomId){
    try{
        const sql = `SELECT * FROM contexts WHERE user_id = ? AND chatroom_id = ? ORDER BY created_at DESC LIMIT 1`;
        const contextData = await db.get(sql, [userId, chatroomId]);
        return contextData ? { data: contextData.data} : null;
    }
    catch(error){
        console.error("Error fetching context: ", error.message);
        throw new Error("Failed to fetch context.");
    }
}

export default router;