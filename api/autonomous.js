// api/autonomous.js
import express from 'express';
import { orchestrateContextWorkflow } from '../src/logic/workflow_manager.js';
import { supabase, supabaseRequest } from '../lib/db.js';
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
          actionResult = await updateContext(query.data, { userId, chatroomId });
          break;
        case 'fetchData':
          actionResult = await fetchData(query.data, { userId, chatroomId });
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
async function updateContext(data, context) {
  try {
    console.log('🔍 Checking sessionContext middleware execution...');
    const { data: updatedData } = await supabaseRequest(
      supabase
        .from('chatrooms')
        .update({ ...data })
        .eq('user_id', context.userId)
        .eq('chatroom_id', context.chatroomId)
    );

    console.log(`🔍 req.session content: ${JSON.stringify(req.session)}`);
    return { updatedContext: { ...context, ...updatedData[0] } }; // Assuming single row update
  } catch (error) {
    console.error("⚠️ Error updating context:", error.message);
    throw new Error("Failed to update context.");
  }
}

// ✅ Handles data fetching
async function fetchData(data, context) {
  try {
    const { data: fetchedData } = await supabaseRequest(
      supabase
        .from('chatrooms')
        .select('*')
        .eq('user_id', context.userId)
        .eq('chatroom_id', context.chatroomId)
    );

    return { data: fetchedData[0] }; // Assuming single row fetch
  } catch (error) {
    console.error("⚠️ Error fetching data:", error.message);
    throw new Error("Failed to fetch data.");
  }
}

export default router;
