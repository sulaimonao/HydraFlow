//api/feedback/summary.js

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.DATABASE_URL;
const supabaseKey = process.env.KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  try {
    const { data, error } = await supabase
      .rpc('feedback_summary'); // Call the materialized view or RPC

    if (error) {
      console.error('Error fetching feedback summary:', error);
      return res.status(500).json({ error: 'Failed to fetch feedback summary.' });
    }

    res.status(200).json({ summary: data });
  } catch (error) {
    console.error('Error in /api/feedback/summary:', error);
    res.status(500).json({ error: 'Unexpected error occurred.' });
  }
}
