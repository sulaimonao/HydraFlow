// routes/feedback_collector.js

import express from "express";
import { getFeedbackLog, generateFeedbackSummary } from "../actions/feedback_collector.js";
import supabase, { supabaseRequest } from '../lib/supabaseClient';

const router = express.Router();

// Get all feedback
router.get("/all", async (req, res) => {
  try {
    const feedback = await supabaseRequest(
      supabase.from('feedback_entries').select('*')
    );
    res.status(200).json({ status: "success", data: feedback });
  } catch (error) {
    console.error("Error retrieving feedback:", error);
    res.status(500).json({ error: "Failed to retrieve feedback." });
  }
});

// Get summarized insights
router.get("/summary", async (req, res) => {
  try {
    const summary = await generateFeedbackSummary();
    res.status(200).json({ status: "success", data: summary });
  } catch (error) {
    console.error("Error generating feedback summary:", error);
    res.status(500).json({ error: "Failed to generate feedback summary." });
  }
});

// Get feedback by task or persona
router.get("/task/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;
    const feedback = await supabaseRequest(
      supabase.from('feedback_entries').select('*').eq('task_id', taskId)
    );
    res.status(200).json({ status: "success", data: feedback });
  } catch (error) {
    console.error("Error retrieving feedback by task:", error);
    res.status(500).json({ error: "Failed to retrieve feedback by task." });
  }
});

router.get("/persona/:personaName", (req, res) => {
  try {
    const { personaName } = req.params;
    const personaFeedback = getFeedbackLog().filter((feedback) => feedback.persona === personaName);
    res.status(200).json({ status: "success", data: personaFeedback });
  } catch (error) {
    console.error("Error retrieving persona feedback:", error);
    res.status(500).json({ error: "Failed to retrieve persona-specific feedback." });
  }
});

export default router;
