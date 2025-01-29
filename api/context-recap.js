// api/context-recap.js
import express from 'express';
import { supabase, supabaseRequest } from '../lib/db.js';
import { orchestrateContextWorkflow } from '../src/logic/workflow_manager.js';
import { updateMemory } from '../src/logic/memory_manager.js';
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
      updateMemory(userId, chatroomId, compressedMemory) //Update memory concurrently
    ]);

    // Check for errors from the concurrent memory update
    if (updateMemoryResult.error) {
      console.error("❌ Failed to update memory in Supabase:", updateMemoryResult.error);
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

    // 📊 Handle Gauge Metrics
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

export default router;
