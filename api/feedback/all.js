//api/feedback/all.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.DATABASE_URL;
const supabaseKey = process.env.KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const { data, error } = await supabase
  .from('feedback_entries')
  .select('*')
  .range(0, 9); // Fetch first 10 entries


export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('feedback_entries')
        .select('*');

      if (error) {
        console.error('Error fetching feedback:', error);
        return res.status(500).json({ error: 'Failed to fetch feedback.' });
      }

      res.status(200).json({ data });
    } catch (error) {
      console.error('Error retrieving feedback:', error);
      res.status(500).json({ error: 'Unexpected error occurred.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
