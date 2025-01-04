// src/actions/feedback_collector.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.DATABASE_URL;
const supabaseKey = process.env.KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export const collectFeedback = async ({ responseId, userFeedback, rating }) => {
  const feedbackEntry = {
    responseId,
    userFeedback,
    rating,
    timestamp: new Date().toISOString(),
  };

  const { data, error } = await supabase.from('feedback_entries').insert([feedbackEntry]);
  if (error) throw new Error(`Error collecting feedback: ${error.message}`);
  return { status: "success", message: "Feedback recorded successfully.", data };
};

export const getFeedbackLog = async () => {
  const { data, error } = await supabase.from('feedback_entries').select('*');
  if (error) throw new Error(`Error fetching feedback log: ${error.message}`);
  return data;
};

export const generateFeedbackSummary = async () => {
  const { data, error } = await supabase.rpc('feedback_summary');
  if (error) throw new Error(`Error generating feedback summary: ${error.message}`);
  return data;
};
