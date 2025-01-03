// routes/feedback.js
import express from "express";
import { collectFeedback, getFeedbackLog, generateFeedbackSummary } from "../src/actions/feedback_collector.js";

const router = express.Router();

/**
 * Collect feedback from users.
 */
router.post("/submit", async (req, res) => {
  try {
    const { responseId, userFeedback, rating } = req.body;

    // Validate input
    if (!responseId || !userFeedback || typeof rating !== "number") {
      return res.status(400).json({ status: "error", message: "Invalid feedback data." });
    }

    // Record feedback
    const result = await collectFeedback({ responseId, userFeedback, rating });
    res.status(200).json(result);
  } catch (error) {
    console.error("Error collecting feedback:", error);
    res.status(500).json({ error: "Failed to record feedback." });
  }
});

/**
 * Retrieve all feedback entries.
 */
router.get("/all", async (req, res) => {
  try {
    const feedback = await getFeedbackLog();
    res.status(200).json(feedback);
  } catch (error) {
    console.error("Error retrieving feedback:", error);
    res.status(500).json({ error: "Failed to retrieve feedback." });
  }
});

/**
 * Retrieve summarized insights from feedback.
 */
router.get("/summary", async (req, res) => {
  try {
    const summary = await generateFeedbackSummary();
    res.status(200).json(summary);
  } catch (error) {
    console.error("Error generating feedback summary:", error);
    res.status(500).json({ error: "Failed to generate feedback summary." });
  }
});

export default router;
