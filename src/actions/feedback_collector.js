// src/actions/feedback_collector.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.DATABASE_URL;
const supabaseKey = process.env.KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Collect feedback
export const collectFeedback = async ({ responseId, userFeedback, rating }) => {
  const feedbackEntry = {
    response_id: responseId,
    user_feedback: userFeedback,
    rating,
    timestamp: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from('feedback_entries')
      .insert([feedbackEntry]);

    if (error) {
      console.error('Error inserting feedback:', error);
      return { status: 'error', message: 'Failed to record feedback.' };
    }

    console.log('Feedback Collected:', data);
    return { status: 'success', message: 'Feedback recorded successfully.', data };
  } catch (err) {
    console.error('Unexpected error in collectFeedback:', err);
    return { status: 'error', message: 'An unexpected error occurred.' };
  }
};

// Get all feedback logs
export const getFeedbackLog = async () => {
  try {
    const { data, error } = await supabase
      .from('feedback_entries')
      .select('*');

    if (error) {
      console.error('Error retrieving feedback:', error);
      return { status: 'error', message: 'Failed to retrieve feedback.', data: [] };
    }

    return { status: 'success', message: 'Feedback retrieved successfully.', data };
  } catch (err) {
    console.error('Unexpected error in getFeedbackLog:', err);
    return { status: 'error', message: 'An unexpected error occurred.', data: [] };
  }
};

// Generate summarized insights
export const generateFeedbackSummary = async () => {
  try {
    const { data, error } = await supabase
      .from('feedback_entries')
      .select('rating');

    if (error) {
      console.error('Error retrieving feedback for summary:', error);
      return { status: 'error', message: 'Failed to generate feedback summary.' };
    }

    const totalFeedback = data.length;
    const averageRating =
      data.reduce((sum, entry) => sum + entry.rating, 0) / totalFeedback || 0;

    const insights = {
      totalFeedback,
      averageRating: parseFloat(averageRating.toFixed(2)),
    };

    console.log('Generated Feedback Summary:', insights);
    return { status: 'success', message: 'Feedback summary generated successfully.', insights };
  } catch (err) {
    console.error('Unexpected error in generateFeedbackSummary:', err);
    return { status: 'error', message: 'An unexpected error occurred.', insights: null };
  }
};
