//api/feedback/summary.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.DATABASE_URL;
const supabaseKey = process.env.KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const averageRating = totalFeedback > 0
  ? (data.reduce((sum, entry) => sum + entry.rating, 0) / totalFeedback).toFixed(2)
  : 'N/A';


export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('feedback_entries')
        .select('rating');

      if (error) {
        console.error('Error fetching feedback summary:', error);
        return res.status(500).json({ error: 'Failed to fetch feedback summary.' });
      }

      const totalFeedback = data.length;
      const averageRating = data.reduce((sum, entry) => sum + entry.rating, 0) / totalFeedback;

      res.status(200).json({
        totalFeedback,
        averageRating: averageRating.toFixed(2),
      });
    } catch (error) {
      console.error('Error generating feedback summary:', error);
      res.status(500).json({ error: 'Unexpected error occurred.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
