// api/feedback.js
import { insertFeedback, getFeedbackLog, generateFeedbackSummary, fetchFeedbackByUser } from '../../lib/db.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      // Submit feedback
      const { userFeedback, rating } = req.body;
      if (!userFeedback || !rating) {
        return res.status(400).json({ error: 'Feedback and rating are required.' });
      }

      // Check for duplicate feedback
      const existingFeedback = await fetchFeedbackByUser(userFeedback);
      if (existingFeedback) {
        return res.status(409).json({ error: 'Duplicate feedback entry detected.' });
      }

      const feedback = await insertFeedback({ userFeedback, rating });
      return res.status(201).json({ message: 'Feedback submitted successfully.', feedback });
    } else if (req.method === 'GET') {
      const { type } = req.query;

      if (type === 'all') {
        // Retrieve all feedback
        const feedback = await getFeedbackLog();
        return res.status(200).json({ feedback });
      } else if (type === 'summary') {
        // Retrieve feedback summary
        const summary = await generateFeedbackSummary();
        return res.status(200).json({ summary });
      } else {
        return res.status(400).json({ error: 'Invalid query type. Use "all" or "summary".' });
      }
    } else {
      res.setHeader('Allow', ['POST', 'GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in feedback API:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
}