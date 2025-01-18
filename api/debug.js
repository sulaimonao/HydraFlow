// api/debug.js
import express from 'express';
import supabase, { supabaseRequest, setSessionContext } from '../lib/supabaseClient.js';
import { orchestrateContextWorkflow } from '../src/logic/workflow_manager.js';

const router = express.Router();

/**
 * Logs issues in the debug_logs table.
 */
export async function logIssue({ userId, contextId, issue, resolution }) {
  try {
    // 🔒 Set session context with error handling
    try {
      await setSessionContext(userId, contextId);
    } catch (sessionError) {
      console.error("❌ Failed to set session context:", sessionError);
      throw new Error("Session context setup failed.");
    }

    const { data, error } = await supabase
      .from('debug_logs')
      .insert([
        {
          user_id: userId,
          context_id: contextId,
          issue,
          resolution,
          created_at: new Date().toISOString(),
        }
      ])
      .select();

    if (error) {
      console.error(`❌ Error logging issue: ${error.message}`);
      throw new Error(`Failed to log issue: ${error.message}`);
    }

    return data[0];
  } catch (error) {
    console.error("❌ Error in logIssue:", error);
    throw error;
  }
}

/**
 * Fetches debug logs for a specific context.
 */
export async function fetchDebugLogs(req, contextId) {
  try {
    // 🌐 Retrieve persistent IDs safely
    const workflowContext = await orchestrateContextWorkflow(req, {
      query: req.body.query || '',
      memory: req.body.memory || '',
      feedback: req.body.feedback || null,
      tokenCount: req.body.tokenCount || 0,
    });

    if (!req.session.userId || !req.session.chatroomId) {
      throw new Error("Invalid session IDs for fetching debug logs.");
    }

    // 🔒 Set session context for RLS enforcement
    await setSessionContext(req.session.userId, req.session.chatroomId);

    const { data, error } = await supabase
      .from('debug_logs')
      .select('*').eq('context_id', contextId)
      .eq('user_id', persistentUserId)
      .eq('chatroom_id', persistentChatroomId)

    if (error) {
      console.error(`❌ Error fetching debug logs: ${error.message}`);
      throw new Error("Failed to fetch debug logs.");
    }

    return data;
  } catch (error) {
    console.error("❌ Error in fetchDebugLogs:", error);
    throw error;
  }
}

/**
 * API Endpoint: Log an issue.
 */
router.post('/debug/log', async (req, res) => {
  try {
    const { query, issue, resolution } = req.body;

    if (!issue || !resolution) {
      return res.status(400).json({ error: "Both 'issue' and 'resolution' are required." });
    }

    // 🌐 Retrieve persistent IDs from workflow
    const workflowContext = await orchestrateContextWorkflow(req, {
      query: query || '',
      memory: req.body.memory || '',
      feedback: req.body.feedback || null,
      tokenCount: req.body.tokenCount || 0,
    });

    if (!req.session.userId || !req.session.chatroomId) {
      return res.status(400).json({ error: "Invalid user or chatroom identifiers." });
    }

    const log = await logIssue({
      userId: req.session.userId,
      contextId: req.session.chatroomId,
      issue,
      resolution
    });

    res.status(200).json({
      message: "Issue logged successfully.",
      log
    });

  } catch (error) {
    console.error("❌ Error in POST /debug/log:", error);
    res.status(500).json({ error: "Failed to log issue.", details: error.message });
  }
});

/**
 * API Endpoint: Retrieve debug logs by context ID.
 */
router.get('/debug/logs/:contextId', async (req, res) => {
  try {
    const { contextId } = req.params;

    if (!contextId) {
      return res.status(400).json({ error: "Context ID is required." });
    }

    const logs = await fetchDebugLogs(req, contextId);

    res.status(200).json({
      message: "Debug logs retrieved successfully.",
      logs
    });

  } catch (error) {
    console.error("❌ Error in GET /debug/logs/:contextId:", error);
    res.status(500).json({ error: "Failed to fetch debug logs.", details: error.message });
  }
});

export default router;
