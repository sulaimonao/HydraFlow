// lib/db.js
import supabase, { supabaseRequest } from './lib/supabaseClient';
// Using centralized supabase client

// Insert feedback into the `feedback_entries` table
export async function insertFeedback({ userFeedback, rating }) {
  try {
    const data = await supabaseRequest(
      supabase.from('feedback_entries').insert([{ user_feedback: userFeedback, rating }])
    );

    return data;
  } catch (error) {
    console.error('Error in insertFeedback:', error);
    throw error;
  }
}
