// routes/feedback_collector.js (Local SQLite Version)
import express from "express";
import * as db from '../lib/db.js'; // Import SQLite db module
import { getFeedbackLog, generateFeedbackSummary } from "../src/actions/feedback_collector.js";
import { orchestrateContextWorkflow } from '../src/logic/workflow_manager.js';
import { sessionContext } from "../middleware/sessionContext.js";

const router = express.Router();

// Use the sessionContext middleware (already created)
router.use(sessionContext);

// Get all feedback
router.get("/all",  async (req, res) => { // Removed enforceSessionContext
    try {
        const { userId, chatroomId } = req.session;
        const feedback = await db.fetchFeedback(userId, chatroomId);
        res.status(200).json({ status: "success", data: feedback });
    } catch (error) {
        console.error("❌ Error retrieving feedback:", error);
        res.status(500).json({ error: "Failed to retrieve feedback." });
    }
});

// Get summarized feedback insights
router.get("/summary", async (req, res) => { // Removed enforceSessionContext
    try {
        // You'll likely want to adapt generateFeedbackSummary to use your db module
        // For now, I'm leaving it as a placeholder.
        const { userId, chatroomId } = req.session; // Get userId and chatroomId
        const feedbackData = await db.fetchFeedback(userId, chatroomId);
        if (!feedbackData || feedbackData.length === 0) {
            return res.status(200).json({ averageRating: 0, message: "No feedback data available." });
          }

        const totalRating = feedbackData.reduce((sum, entry) => sum + entry.rating, 0);
        const averageRating = (totalRating / feedbackData.length).toFixed(2);

        const summary = {averageRating}; // Call generate feedback summary with the average rating
        res.status(200).json({ status: "success", data: summary });
    } catch (error) {
        console.error("❌ Error generating feedback summary:", error);
        res.status(500).json({ error: "Failed to generate feedback summary." });
    }
});

// Get feedback by task ID
router.get("/task/:taskId",  async (req, res) => { // Removed enforceSessionContext
    try {
        const { taskId } = req.params;
        const { userId, chatroomId } = req.session;

        // You need to implement db.fetchFeedbackByTask(userId, chatroomId, taskId) in lib/db.js
        const feedback = await db.fetchFeedbackByTask(userId, chatroomId, taskId); // Placeholder

        if (!feedback) {
          return res.status(404).json({ error: "No feedback found for this task."});
        }

        res.status(200).json({ status: "success", data: feedback });
    } catch (error) {
        console.error("❌ Error retrieving feedback by task:", error);
        res.status(500).json({ error: "Failed to retrieve feedback by task." });
    }
});

// Get feedback by persona
router.get("/persona/:personaName",  async (req, res) => { // Removed enforceSessionContext
    try {
        const { personaName } = req.params;
        const { userId, chatroomId } = req.session;

        // You need to implement db.fetchFeedbackByPersona(userId, chatroomId, personaName) in lib/db.js
        const feedback = await db.fetchFeedbackByPersona(userId, chatroomId, personaName); // Placeholder

        if (!feedback) {
          return res.status(404).json({ error: "No feedback found for this persona."});
        }

        res.status(200).json({ status: "success", data: feedback });
    } catch (error) {
        console.error("❌ Error retrieving persona feedback:", error);
        res.status(500).json({ error: "Failed to retrieve persona-specific feedback." });
    }
});

export default router;