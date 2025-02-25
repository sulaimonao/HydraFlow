// src/actions/feedback_collector.js (Local SQLite Version)
// Removed Supabase imports
//import { supabase, supabaseRequest } from '../lib/db.js';
import * as db from '../../lib/db.js'; // Import SQLite db module
// Removed setSessionContext import
//import { setSessionContext } from '../../lib/sessionUtils.js';


/**
 * ✅ Collect feedback and associate it with user and chatroom context.
 * @param {Object} params - Feedback details.
 * @param {string} params.responseId - Unique response ID.
 * @param {string} params.userFeedback - User feedback text.
 * @param {number} params.rating - Feedback rating (1-5).
 * @param {object} req - The request object, containing session information
 * @returns {Object} Result of feedback submission.
 */
export const collectFeedback = async ({ responseId, userFeedback, rating }, req) => { // Added req
    try {
        // Get userId and chatroomId from req.session
        const { userId, chatroomId } = req.session;

        // ✅ Validate input
        if (!userId || !chatroomId) {
            throw new Error("❌ Missing user_id or chatroom_id for feedback submission.");
        }

        // 🔒 No need to set session context - handled by middleware
        // await setSessionContext(userId, chatroomId);

        // 📦 Prepare feedback entry (using parameter names)
        const feedbackEntry = {
            response_id: responseId,
            user_feedback: userFeedback,
            rating,
            user_id: userId,
            chatroom_id: chatroomId,
            // Removed timestamp, handled by db
        };

        // 🚀 Insert feedback entry using db.submitFeedback
        const result = await db.submitFeedback(userId, chatroomId, responseId, userFeedback, rating);

        if (!result || !result.id) {
            console.error('❌ Error inserting feedback:');
            return { status: 'error', message: 'Failed to record feedback.' };
        }

        console.log('✅ Feedback Collected:', result);
        return { status: 'success', message: 'Feedback recorded successfully.', data: { id: result.id } }; // Return the ID

    } catch (err) {
        console.error('❌ Unexpected error in collectFeedback:', err);
        return { status: 'error', message: 'An unexpected error occurred.' };
    }
};

/**
 * ✅ Retrieve all feedback logs, filtered by user and chatroom context.
 * @param {object} req - The request object
 * @returns {Object} Feedback logs or error message.
 */
export const getFeedbackLog = async (req) => { // Added req
    try {
        // Get userId and chatroomId from req.session
        const { userId, chatroomId } = req.session;
        if (!userId || !chatroomId) {
            throw new Error("❌ Missing user_id or chatroom_id for feedback retrieval.");
          }

        // 🔒 No need to set session context - handled by middleware
        // await setSessionContext(userId, chatroomId);

        // 📦 Fetch feedback entries using db.fetchFeedback
        const feedbackData = await db.fetchFeedback(userId, chatroomId);

        if (!feedbackData) {
          return { status: 'error', message: 'Failed to retrieve feedback.', data: [] };
        }

        return { status: 'success', message: 'Feedback retrieved successfully.', data: feedbackData };

    } catch (err) {
        console.error('❌ Unexpected error in getFeedbackLog:', err);
        return { status: 'error', message: 'An unexpected error occurred.', data: [] };
    }
};

/**
 * ✅ Generate a feedback summary for a user in a specific chatroom.
 * @param {object} req - Request object
 * @returns {Object} Summary insights or error message.
 */
export const generateFeedbackSummary = async (req) => { //Added req
    try {
        // Get userId and chatroomId from req.session
        const { userId, chatroomId } = req.session;
        if(!userId || !chatroomId){
          throw new Error('❌ Missing user_id or chatroom_id');
        }

        // 🔒 No need to set session context - handled by middleware
        // await setSessionContext(userId, chatroomId);

        // 📊 Fetch only ratings for summary calculation using db.fetchFeedback
        const feedbackData = await db.fetchFeedback(userId, chatroomId);
        if(!feedbackData){
          return { status: 'error', message: 'Failed to generate feedback summary.' };
        }

        const totalFeedback = feedbackData.length;
        const averageRating = totalFeedback > 0
            ? parseFloat((feedbackData.reduce((sum, entry) => sum + entry.rating, 0) / totalFeedback).toFixed(2))
            : 0;

        const insights = {
            totalFeedback,
            averageRating,
        };

        console.log('📊 Generated Feedback Summary:', insights);
        return { status: 'success', message: 'Feedback summary generated successfully.', insights };

    } catch (err) {
        console.error('❌ Unexpected error in generateFeedbackSummary:', err);
        return { status: 'error', message: 'An unexpected error occurred.', insights: null };
    }
};