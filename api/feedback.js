// api/feedback.js (Local SQLite Version)
import express from 'express';
// Removed supabase import
//import { supabase } from '../lib/db.js';
import * as db from '../lib/db.js'; // Import SQLite db module
import { orchestrateContextWorkflow } from '../src/logic/workflow_manager.js';
import { sessionContext } from '../middleware/sessionContext.js';
// Removed setSessionContext import
//import { setSessionContext } from '../lib/sessionUtils.js';

const router = express.Router(); // Use Express Router

// Use the router to handle requests
router.post('/', sessionContext, async (req, res) => {
    await submitFeedback(req, res);
});

router.get('/', sessionContext, async (req, res) => {
    await handleGetFeedback(req, res);
});
// Keep the handler function
async function handler(req, res) {
    try {
        sessionContext(req, res, async () => {
            try {
                const { userId, chatroomId } = req.session;
                // Removed setSessionContext
                //await setSessionContext(userId, chatroomId);
                switch (req.method) {
                    case 'POST':
                        return await submitFeedback(req, res);
                    case 'GET':
                        return await handleGetFeedback(req, res);
                    default:
                        return res.status(405).json({ error: 'Method not allowed.' });
                }
            } catch (error) {
                console.error("❌ Error in feedback handler:", error);
                res.status(500).json({ error: "Failed to handle feedback.", details: error.message });
            }
        });
    } catch (error) {
        console.error("❌ Error in session context:", error);
        res.status(500).json({ error: "Failed to set session context.", details: error.message });
    }
}

/**
 * Handles GET feedback requests by type.
 */
async function handleGetFeedback(req, res) {
    const { type } = req.query;
    const { userId, chatroomId } = req.session; // Get userId and chatroomId from session

    switch (type) {
        case 'summary':
            return await getFeedbackSummary(req, res, userId, chatroomId); // Pass userId and chatroomId
        case 'all':
            return await getAllFeedback(req, res, userId, chatroomId); // Pass userId and chatroomId
        case 'task':
            return await getFeedbackByTask(req, res); // (Implementation needed)
        case 'persona':
            return await getFeedbackByPersona(req, res); // (Implementation needed)
        default:
            return res.status(400).json({ error: 'Invalid feedback type.' });
    }
}

/**
 * Handles feedback submission.
 */
async function submitFeedback(req, res) {
    const { userId, chatroomId } = req.session;
    const { query, responseNumber, userFeedback, rating } = req.body;

    if (!userFeedback || typeof userFeedback !== 'string') {
        return res.status(400).json({ error: "'userFeedback' must be a non-empty string." });
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "'rating' must be a number between 1 and 5." });
    }

    try {
        const workflowResult = await orchestrateContextWorkflow(req, {
            query: query || '',
            memory: req.body.memory || '',
            feedback: userFeedback,
            tokenCount: req.body.tokenCount || 0,
        });

        const responseId = `${chatroomId}_${responseNumber || 0}`; // Handle undefined responseNumber

        // Store feedback using db.submitFeedback
        const result = await db.submitFeedback(userId, chatroomId, responseId, userFeedback, rating);


        await improveWorkflowsBasedOnFeedback(userFeedback, rating);
        return res.status(200).json({ message: "Feedback submitted successfully.", data: { id: result.id }, workflowResult }); // Return the ID
    } catch (error) {
        return handleError(res, error);
    }
}

function handleError(res, error) {
    console.error("❌ Error:", error);
    const errorMessage = error.message || "Internal server error.";
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ error: errorMessage });
}

/**
 * Adjust workflows based on feedback. (This is a placeholder, keep as-is)
 */
async function improveWorkflowsBasedOnFeedback(userFeedback, rating) {
    if (rating < 3) {
        console.warn("⚠️ Negative feedback received.  Adjusting workflows:", userFeedback);
    }
}

/**
 * Provides feedback summary with average rating.
 */
async function getFeedbackSummary(req, res, userId, chatroomId) {
    try {
        // Use the fetchFeedback from db.js
        const feedbackData = await db.fetchFeedback(userId, chatroomId);


        if (!feedbackData || feedbackData.length === 0) {
            return res.status(200).json({ averageRating: 0, message: "No feedback data available." });
        }

        const totalRating = feedbackData.reduce((sum, entry) => sum + entry.rating, 0);
        const averageRating = (totalRating / feedbackData.length).toFixed(2);

        return res.status(200).json({ averageRating });
    } catch (error) {
        console.error("❌ Error in getFeedbackSummary:", error);
        return res.status(500).json({ error: error.message });
    }
}

/**
 * Retrieves all feedback entries.
 */
async function getAllFeedback(req, res, userId, chatroomId) {
    try {
        // Fetch feedback using the db.js module
        const feedbackData = await db.fetchFeedback(userId, chatroomId);
        if (!feedbackData) {
            return res.status(404).json({ message: 'No feedback found' });
        }

        return res.status(200).json({ message: "All feedback retrieved.", data: feedbackData });
    } catch (error) {
        console.error("❌ Error in getAllFeedback:", error);
        return res.status(500).json({ error: error.message });
    }
}

/**
 * Fetches feedback by task ID.  (Placeholder - Needs Implementation)
 */
async function getFeedbackByTask(req, res) {
    const { taskId } = req.query;

    if (!taskId) {
        return res.status(400).json({ error: "taskId is required." });
    }
    // You'll need to add task_id to your feedback_entries table and
    // implement a db.fetchFeedbackByTask(taskId) function in lib/db.js
    return res.status(501).json({ error: "getFeedbackByTask not implemented." });
}

/**
 * Fetches feedback by persona ID. (Placeholder - Needs Implementation)
 */
async function getFeedbackByPersona(req, res) {
    const { personaId } = req.query;

    if (!personaId) {
        return res.status(400).json({ error: "personaId is required." });
    }

    // You'll need to add persona_id (or head_id) to your feedback_entries table
    // and implement a db.fetchFeedbackByPersona(personaId) function in lib/db.js
    return res.status(501).json({ error: "getFeedbackByPersona not implemented." });
}

export default router; // Export the router