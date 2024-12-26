//api/feedback/all.js

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.DATABASE_URL;
const supabaseKey = process.env.KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  try {
    const { data, error } = await supabase
      .from('feedback_entries')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching feedback:', error);
      return res.status(500).json({ error: 'Failed to fetch feedback.' });
    }

    res.status(200).json({ data });
  } catch (error) {
    console.error('Error in /api/feedback/all:', error);
    res.status(500).json({ error: 'Unexpected error occurred.' });
  }
}
