// api/feedback/submit.js
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid'; // Import UUID library

// Initialize Supabase client
const supabaseUrl = process.env.DATABASE_URL;
const supabaseKey = process.env.KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userFeedback, rating } = req.body;

    // Input validation
    if (!userFeedback || typeof userFeedback !== 'string' || !rating || isNaN(rating)) {
      return res.status(400).json({ error: 'Invalid input. Please provide valid feedback and rating.' });
    }

    try {
      // Generate a unique response_id
      const responseId = uuidv4();

      // Insert feedback into the feedback_entries table and return the inserted data
      const { data, error } = await supabase
        .from('feedback_entries')
        .insert([{ response_id: responseId, user_feedback: userFeedback, rating }])
        .select('*'); // Explicitly select the inserted row

      if (error) {
        console.error('Error inserting feedback:', error);
        return res.status(500).json({ error: 'Failed to submit feedback. Please try again.' });
      }

      res.status(200).json({ message: 'Feedback submitted successfully.', data });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      res.status(500).json({ error: 'Unexpected error occurred.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
