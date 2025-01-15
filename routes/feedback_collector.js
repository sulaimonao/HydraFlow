// routes/feedback_collector.js
import express from "express";
import { getFeedbackLog, generateFeedbackSummary } from "../src/actions/feedback_collector.js";
import supabase, { supabaseRequest, setSessionContext } from '../lib/supabaseClient.js';
import { orchestrateContextWorkflow } from '../src/logic/workflow_manager.js';  // ✅ Import workflow manager

const router = express.Router();

// ✅ Middleware to set session context for Supabase RLS
async function enforceSessionContext(req, res, next) {
  const { query } = req.body;

  try {
    const workflowContext = await orchestrateContextWorkflow({ query, req });
    const { user_id, chatroom_id } = workflowContext.generatedIdentifiers;

    if (!user_id || !chatroom_id) {
      return res.status(403).json({ error: "Unauthorized access. Missing session identifiers." });
    }

    await setSessionContext(user_id, chatroom_id);
    req.user_id = user_id;
    req.chatroom_id = chatroom_id;
    next();
  } catch (error) {
    console.error("Error enforcing session context:", error);
    res.status(500).json({ error: "Failed to set session context." });
  }
}

// ✅ Get all feedback with session enforcement
router.get("/all", enforceSessionContext, async (req, res) => {
  try {
    const feedback = await supabaseRequest(() =>
      supabase
        .from('feedback_entries')
        .select('*')
        .eq('user_id', req.user_id)
        .eq('chatroom_id', req.chatroom_id)
    );
    res.status(200).json({ status: "success", data: feedback });
  } catch (error) {
    console.error("Error retrieving feedback:", error);
    res.status(500).json({ error: "Failed to retrieve feedback." });
  }
});

// ✅ Get summarized insights with session enforcement
router.get("/summary", enforceSessionContext, async (req, res) => {
  try {
    const summary = await generateFeedbackSummary();
    res.status(200).json({ status: "success", data: summary });
  } catch (error) {
    console.error("Error generating feedback summary:", error);
    res.status(500).json({ error: "Failed to generate feedback summary." });
  }
});

// ✅ Get feedback by task, linked with workflow ID
router.get("/task/:taskId", enforceSessionContext, async (req, res) => {
  try {
    const { taskId } = req.params;

    const feedback = await supabaseRequest(() =>
      supabase
        .from('feedback_entries')
        .select('*')
        .eq('task_id', taskId)
        .eq('user_id', req.user_id)
        .eq('chatroom_id', req.chatroom_id)
    );

    res.status(200).json({ status: "success", data: feedback });
  } catch (error) {
    console.error("Error retrieving feedback by task:", error);
    res.status(500).json({ error: "Failed to retrieve feedback by task." });
  }
});

// ✅ Get feedback by persona, with proper database filtering
router.get("/persona/:personaName", enforceSessionContext, async (req, res) => {
  try {
    const { personaName } = req.params;

    const { data, error } = await supabaseRequest(() =>
      supabase
        .from('feedback_entries')
        .select('*')
        .eq('persona', personaName)
        .eq('user_id', req.user_id)
        .eq('chatroom_id', req.chatroom_id)
    );

    if (error) {
      throw new Error(`Error fetching persona feedback: ${error.message}`);
    }

    res.status(200).json({ status: "success", data });
  } catch (error) {
    console.error("Error retrieving persona feedback:", error);
    res.status(500).json({ error: "Failed to retrieve persona-specific feedback." });
  }
});

export default router;
