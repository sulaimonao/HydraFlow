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

export default router;
