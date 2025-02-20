// api/context-recap.js (Local SQLite Version)
import express from 'express';
// Removed supabase import
//import { supabase, supabaseRequest } from '../lib/db.js';
import * as db from '../lib/db.js'; // Import SQLite db module
import { orchestrateContextWorkflow } from '../src/logic/workflow_manager.js';
//Removed updateMemory import
//import { updateMemory } from '../src/logic/memory_manager.js';
import { sessionContext } from '../middleware/sessionContext.js';

const router = express.Router();

router.post('/', sessionContext, async (req, res) => {
    try {
        const { query, history, compressedMemory, additionalNotes } = req.body;

        // ✅ Validate required inputs
        if (!query || !compressedMemory || !history) {
            return res.status(400).json({ error: "Query, 'history', and 'compressedMemory' are required." });
        }

        if (additionalNotes && typeof additionalNotes !== 'string') {
            return res.status(400).json({ error: "'additionalNotes' must be a string if provided." });
        }

        const { userId, chatroomId } = req.session;

        // 🌐 Run workflow and update memory concurrently

        const [workflowContext, updateMemoryResult] = await Promise.all([
            orchestrateContextWorkflow(req, {
                query: query,
                history: history,
                compressedMemory: compressedMemory,
                additionalNotes: additionalNotes,
                tokenCount: req.body.tokenCount || 0, // Add tokenCount
            }),
            // Call db.updateMemory (this function now handles both insert and update)
            db.updateMemory(userId, chatroomId, compressedMemory),
        ]);


        // Check for errors from the concurrent memory update (simplified check)
        if (!updateMemoryResult) {
            console.error("❌ Failed to update memory:");
            throw new Error("Failed to update memory.");
        }


        // 📖 Construct the Context Recap
        const recap = `
      === Context Recap ===
      User ID: ${userId}
      Chatroom ID: ${chatroomId}

      Compressed Memory:
      ${compressedMemory}

      Conversation History:
      ${history}

      ${additionalNotes ? `Additional Notes:\n${additionalNotes}\n` : ''}
    `;

        // 📊 Handle Gauge Metrics (assuming gatherGaugeData is defined elsewhere and works locally)
        const gaugeMetrics = await gatherGaugeData({ user_id: userId, chatroom_id: chatroomId });

        res.status(200).json({
            message: "Context recap generated successfully.",
            recap,
            gaugeMetrics,
        });
    } catch (error) {
        console.error("❌ Error in context-recap handler:", error);
        res.status(500).json({ error: "Failed to generate context recap.", details: error.message });
    }
});

// Placeholder for gatherGaugeData (ensure this function exists and works correctly)
async function gatherGaugeData(context) {
  // Replace this with your actual gauge data gathering logic
  // This is just an example; you'll need to implement this based on your metrics
  return {
    exampleMetric: 123,
    anotherMetric: "example",
  };
}

export default router;