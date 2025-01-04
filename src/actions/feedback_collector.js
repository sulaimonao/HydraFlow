// src/actions/feedback_collector.js
import supabase, { supabaseRequest } from '../../lib/supabaseClient';

export const collectFeedback = async ({ responseId, userFeedback, rating }) => {
  const feedbackEntry = {
    responseId,
    userFeedback,
    rating,
    timestamp: new Date().toISOString(),
  };

  const data = await supabaseRequest(
    supabase.from('feedback_entries').insert([feedbackEntry])
  );
  return { status: "success", message: "Feedback recorded successfully.", data };
};

export const getFeedbackLog = async () => {
  const data = await supabaseRequest(
    supabase.from('feedback_entries').select('*')
  );
  return data;
};

export const generateFeedbackSummary = async () => {
  const data = await supabaseRequest(
    supabase.rpc('feedback_summary')
  );
  return data;
};
