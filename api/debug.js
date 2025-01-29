// api/debug.js
import express from 'express';
import { logIssue, fetchDebugLogs } from '../lib/db.js';
import { sessionContext } from '../middleware/sessionContext.js';

const router = express.Router();

router.post('/log', sessionContext, async (req, res) => {
  try {
    const { issue, resolution } = req.body;
    const { userId, chatroomId } = req.session;

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

router.get('/logs/:contextId', sessionContext, async (req, res) => {
  try {
    const { contextId } = req.params;
    const { userId, chatroomId } = req.session;

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

export default router;
