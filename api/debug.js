// api/debug.js
import express from 'express';
import supabase, { supabaseRequest } from '../lib/supabaseClient.js';
import { sessionContext } from '../middleware/sessionContext.js';

const router = express.Router();

/**
 * Logs issues in the debug_logs table.
 */
async function logIssue({ userId, contextId, issue, resolution }) {
  try {
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
async function fetchDebugLogs(contextId, userId, chatroomId) {
  try {
    const { data, error } = await supabase
      .from('debug_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('chatroom_id', chatroomId)
      .eq('context_id', contextId);

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
router.post('/debug/log', (req, res) => {
  sessionContext(req, res, async () => {
    try {
      const { issue, resolution } = req.body;
      const { userId, chatroomId } = req.locals;

      if (!issue || !resolution) {
        return res.status(400).json({ error: "Both 'issue' and 'resolution' are required." });
      }

      const log = await logIssue({
        userId,
        contextId: chatroomId,
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
});

/**
 * API Endpoint: Retrieve debug logs by context ID.
 */
router.get('/debug/logs/:contextId', (req, res) => {
  sessionContext(req, res, async () => {
    try {
      const { contextId } = req.params;
      const { userId, chatroomId } = req.locals;

      if (!contextId) {
        return res.status(400).json({ error: "Context ID is required." });
      }

      const logs = await fetchDebugLogs(contextId, userId, chatroomId);

      res.status(200).json({
        message: "Debug logs retrieved successfully.",
        logs
      });

    } catch (error) {
      console.error("❌ Error in GET /debug/logs/:contextId:", error);
      res.status(500).json({ error: "Failed to fetch debug logs.", details: error.message });
    }
  });
});

export default router;
