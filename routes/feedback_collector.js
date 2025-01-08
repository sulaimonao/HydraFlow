// routes/feedback_collector.js

import express from "express";
import { getFeedbackLog, generateFeedbackSummary } from "../actions/feedback_collector.js";

const router = express.Router();

// Get all feedback
router.get("/all", (req, res) => {
  try {
    const feedback = getFeedbackLog();
    res.status(200).json({ status: "success", data: feedback });
  } catch (error) {
    console.error("Error retrieving feedback:", error);
    res.status(500).json({ error: "Failed to retrieve feedback." });
  }
});

// Get summarized insights
router.get("/summary", (req, res) => {
  try {
    const summary = generateFeedbackSummary();
    res.status(200).json({ status: "success", data: summary });
  } catch (error) {
    console.error("Error generating feedback summary:", error);
    res.status(500).json({ error: "Failed to generate feedback summary." });
  }
});

// Get feedback by task or persona
router.get("/task/:taskId", (req, res) => {
  try {
    const { taskId } = req.params;
    const taskFeedback = getFeedbackLog().filter((feedback) => feedback.taskId === taskId);
    res.status(200).json({ status: "success", data: taskFeedback });
  } catch (error) {
    console.error("Error retrieving task feedback:", error);
    res.status(500).json({ error: "Failed to retrieve task-specific feedback." });
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
