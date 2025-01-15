// src/actions/feedback_collector.js
import supabase, { supabaseRequest, setSessionContext, createSession } from '../../lib/supabaseClient.js';

/**
 * ✅ Collect feedback and associate it with user and chatroom context.
 * @param {Object} params - Feedback details.
 * @param {string} params.responseId - Unique response ID.
 * @param {string} params.userFeedback - User feedback text.
 * @param {number} params.rating - Feedback rating (1-5).
 * @param {string} params.user_id - User ID for context.
 * @param {string} params.chatroom_id - Chatroom ID for context.
 * @returns {Object} Result of feedback submission.
 */
export const collectFeedback = async ({ responseId, userFeedback, rating, user_id, chatroom_id }) => {
  try {
    // ✅ Validate input
    if (!user_id || !chatroom_id) {
      throw new Error("❌ Missing user_id or chatroom_id for feedback submission.");
    }

    // 🔐 Ensure session exists in user_sessions table
    await createSession(user_id, chatroom_id);

    // 🔒 Set Supabase session context for RLS
    await setSessionContext(user_id, chatroom_id);

    // 📦 Prepare feedback entry
    const feedbackEntry = {
      response_id: responseId,
      user_feedback: userFeedback,
      rating,
      user_id,       // ✅ Include user_id
      chatroom_id,   // ✅ Include chatroom_id
      timestamp: new Date().toISOString(),
    };

    // 🚀 Insert feedback entry
    const { data, error } = await supabaseRequest(
      supabase.from('feedback_entries').insert([feedbackEntry])
    );

    if (error) {
      console.error('❌ Error inserting feedback:', error);
      return { status: 'error', message: 'Failed to record feedback.' };
    }

    console.log('✅ Feedback Collected:', data);
    return { status: 'success', message: 'Feedback recorded successfully.', data };

  } catch (err) {
    console.error('❌ Unexpected error in collectFeedback:', err);
    return { status: 'error', message: 'An unexpected error occurred.' };
  }
};

/**
 * ✅ Retrieve all feedback logs, filtered by user and chatroom context.
 * @param {string} user_id - User ID for filtering.
 * @param {string} chatroom_id - Chatroom ID for filtering.
 * @returns {Object} Feedback logs or error message.
 */
export const getFeedbackLog = async (user_id, chatroom_id) => {
  try {
    // 🔐 Ensure session exists in user_sessions table
    await createSession(user_id, chatroom_id);

    // 🔒 Set Supabase session context for RLS
    await setSessionContext(user_id, chatroom_id);

    // 📦 Fetch feedback entries specific to the user and chatroom
    const { data, error } = await supabaseRequest(
      supabase.from('feedback_entries')
        .select('*')
        .eq('user_id', user_id)
        .eq('chatroom_id', chatroom_id)
    );

    if (error) {
      console.error('❌ Error retrieving feedback:', error);
      return { status: 'error', message: 'Failed to retrieve feedback.', data: [] };
    }

    return { status: 'success', message: 'Feedback retrieved successfully.', data };

  } catch (err) {
    console.error('❌ Unexpected error in getFeedbackLog:', err);
    return { status: 'error', message: 'An unexpected error occurred.', data: [] };
  }
};

/**
 * ✅ Generate a feedback summary for a user in a specific chatroom.
 * @param {string} user_id - User ID for summary generation.
 * @param {string} chatroom_id - Chatroom ID for summary generation.
 * @returns {Object} Summary insights or error message.
 */
export const generateFeedbackSummary = async (user_id, chatroom_id) => {
  try {
    // 🔐 Ensure session exists in user_sessions table
    await createSession(user_id, chatroom_id);

    // 🔒 Set Supabase session context for RLS
    await setSessionContext(user_id, chatroom_id);

    // 📊 Fetch only ratings for summary calculation
    const { data, error } = await supabaseRequest(
      supabase.from('feedback_entries')
        .select('rating')
        .eq('user_id', user_id)
        .eq('chatroom_id', chatroom_id)
    );

    if (error) {
      console.error('❌ Error retrieving feedback for summary:', error);
      return { status: 'error', message: 'Failed to generate feedback summary.' };
    }

    const totalFeedback = data.length;
    const averageRating = totalFeedback > 0
      ? parseFloat((data.reduce((sum, entry) => sum + entry.rating, 0) / totalFeedback).toFixed(2))
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
