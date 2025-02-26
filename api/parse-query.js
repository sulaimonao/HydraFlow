//api/parse-query.js (Local SQLite Version)
import express from 'express';
import { orchestrateContextWorkflow } from '../src/logic/workflow_manager.js';
// Removed Supabase import
//import { fetchTaskCards } from '../lib/db.js';
import * as db from '../lib/db.js'; // Import SQLite db module
import { sessionContext } from '../middleware/sessionContext.js';
// Removed setSessionContext import
//import { setSessionContext } from '../lib/sessionUtils.js';

const router = express.Router();

router.post('/', sessionContext, async (req, res) => {
    try {
        const { userId, chatroomId } = req.session;
        // Removed setSessionContext call
        //await setSessionContext(userId, chatroomId);

        const { query } = req.body;

        // ✅ Input Validation
        if (!query || typeof query !== "string" || query.trim().length === 0) {
            console.warn("⚠️ Invalid query input.");
            return res.status(400).json({ error: "A valid query string is required." });
        }

        // 📦 Fetch existing task cards using db.fetchTaskCards
        const existingTaskCardsPromise = db.fetchTaskCards(userId, chatroomId);

        // 📝 Initialize tasks and details
        const actionItems = [];
        const extractedDetails = {};

        // 🔍 Predictive parsing and task identification
        if (/summarize.*logs/i.test(query)) {
            actionItems.push("summarize-logs");
            extractedDetails["summarize-logs"] = "Summarize the provided logs for key patterns and errors.";
        }

        if (/create.*persona/i.test(query)) {
            actionItems.push("create-subpersona");
            const personaDescriptionMatch = query.match(/create.*persona.*(?:like|inspired by)?\s(.*)/i);
            extractedDetails["create-subpersona"] = personaDescriptionMatch?.[1] || "Generic persona for dynamic user interaction.";
        }

        if (/optimize.*memory/i.test(query)) {
            actionItems.push("compress-memory");
            extractedDetails["compress-memory"] = "Compress and optimize memory for efficient usage.";
        }

        // 📝 Construct a structured task card
        const taskCard = {
            goal: query,
            priority: "High",
            subtasks: actionItems.map((item) => ({
                task: item,
                status: "pending",
                description: extractedDetails[item] || "No additional details provided.",
            })),
        };

        // 🚀 Predictive analysis and workflow orchestration
        const existingTaskCards = await existingTaskCardsPromise; // Await the promise here
        let workflowPlan;
        try {
            workflowPlan = await orchestrateContextWorkflow({ // Pass req, userId and chatroomId
                query: query,
                memory: req.body.memory || '',
                feedback: req.body.feedback || null,
                tokenCount: req.body.tokenCount || 0,
                existingTasks: existingTaskCards,
                proposedTasks: taskCard.subtasks,
                req: req,
                userId: userId,
                chatroomId: chatroomId,
            });
            console.log("🚀 Workflow plan:", workflowPlan);

        } catch (workflowError) {
            console.error("❌ Workflow orchestration failed:", workflowError);
            return res.status(500).json({ error: "Workflow orchestration failed." });
        }

        // 🔍 Enhanced keyword extraction (removes special characters)
        const keywords = query.match(/\b\w+\b/g) || [];

        // ✅ Respond with structured data
        res.status(200).json({
            keywords,
            actionItems,
            taskCard,
            workflowPlan,
            gaugeMetrics: res.locals?.gaugeMetrics || {},
            user_id: userId,
            chatroom_id: chatroomId,
            message: "Query parsed and workflow planned successfully.",
        });

    } catch (error) {
        console.error("❌ Error in parse-query handler:", error);
        res.status(500).json({ error: "Failed to parse query.", details: error.message });
    }
});

export default router;