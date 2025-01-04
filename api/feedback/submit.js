// api/feedback/submit.js 
import supabase, { supabaseRequest } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userFeedback, rating } = req.body;

    // Input validation
    if (!userFeedback || typeof userFeedback !== 'string' || !rating || isNaN(rating)) {
      return res.status(400).json({ error: 'Invalid input. Please provide valid feedback and rating.' });
    }

    try {
      // Insert feedback into the feedback_entries table
      const data = await supabaseRequest(
        supabase.from('feedback_entries').insert([{ user_feedback: userFeedback, rating }])
      );

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