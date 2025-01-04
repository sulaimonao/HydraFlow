// lib/db.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Load environment variables
const supabaseUrl = process.env.DATABASE_URL;
const supabaseKey = process.env.KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Supabase URL:', process.env.DATABASE_URL);
console.log('Supabase Key:', process.env.KEY);

// Insert feedback into the `feedback_entries` table
export async function insertFeedback({ userFeedback, rating }) {
  try {
    const { data, error } = await supabase
      .from('feedback_entries')
      .insert([{ user_feedback: userFeedback, rating }]);

    if (error) {
      throw new Error(`Error inserting feedback: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in insertFeedback:', error);
    throw error;
  }
}
