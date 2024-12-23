// api/feedback/submit.js
import { insertFeedback } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userFeedback, rating } = req.body;
    try {
      await insertFeedback({ userFeedback, rating });
      res.status(200).json({ message: 'Feedback submitted successfully.' });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      res.status(500).json({ error: 'Failed to submit feedback.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
