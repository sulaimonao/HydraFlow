// routes/feedback_collector.js
import express from "express";
import { getFeedbackLog, generateFeedbackSummary } from "../src/actions/feedback_collector.js";
import { supabase, supabaseRequest } from '../lib/db.js';
import { setSessionContext } from '../lib/sessionUtils.js';
import { orchestrateContextWorkflow } from '../src/logic/workflow_manager.js';

const router = express.Router();

// ✅ Middleware to enforce session context using user_sessions table
async function enforceSessionContext(req, res, next) {
  try {
    if (!req.session.userId || !req.session.chatroomId) {
      return res.status(403).json({ error: "Unauthorized access. Missing session identifiers." });
    }

    // ✅ Set session context in user_sessions
    await setSessionContext(req.session.userId, req.session.chatroomId);

    req.user_id = req.session.userId;
    req.chatroom_id = req.session.chatroomId;
    next();
  } catch (error) {
    console.error("❌ Error enforcing session context:", error);
    res.status(500).json({ error: "Failed to set session context." });
  }
}

// ✅ Get all feedback with session enforcement
router.get("/all", enforceSessionContext, async (req, res) => {
  try {
    const feedback = await supabaseRequest(
      supabase
        .from('feedback_entries')
        .select('*')
        .eq('user_id', req.session.userId)
        .eq('chatroom_id', req.session.chatroomId)
    );

    res.status(200).json({ status: "success", data: feedback });
  } catch (error) {
    console.error("❌ Error retrieving feedback:", error);
    res.status(500).json({ error: "Failed to retrieve feedback." });
  }
});

// ✅ Get summarized feedback insights
router.get("/summary", enforceSessionContext, async (req, res) => {
  try {
    const summary = await generateFeedbackSummary();
    res.status(200).json({ status: "success", data: summary });
  } catch (error) {
    console.error("❌ Error generating feedback summary:", error);
    res.status(500).json({ error: "Failed to generate feedback summary." });
  }
});

// ✅ Get feedback by task ID
router.get("/task/:taskId", enforceSessionContext, async (req, res) => {
  try {
    const { taskId } = req.params;

    const feedback = await supabaseRequest(
      supabase
        .from('feedback_entries')
        .select('*')
        .eq('task_id', taskId)        
        .eq('user_id', req.session.userId)
        .eq('chatroom_id', req.session.chatroomId)
    );

    res.status(200).json({ status: "success", data: feedback });
  } catch (error) {
    console.error("❌ Error retrieving feedback by task:", error);
    res.status(500).json({ error: "Failed to retrieve feedback by task." });
  }
});

// ✅ Get feedback by persona
router.get("/persona/:personaName", enforceSessionContext, async (req, res) => {
  try {
    const { personaName } = req.params;

    const feedback = await supabaseRequest(
      supabase
        .from('feedback_entries')
        .select('*')
        .eq('persona', personaName)        
        .eq('user_id', req.session.userId)
        .eq('chatroom_id', req.session.chatroomId)
    );

    res.status(200).json({ status: "success", data: feedback });
  } catch (error) {
    console.error("❌ Error retrieving persona feedback:", error);
    res.status(500).json({ error: "Failed to retrieve persona-specific feedback." });
  }
});

export default router;
