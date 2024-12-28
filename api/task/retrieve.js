// api/task/retrieve.js
import { fetchTaskCards } from '../../lib/db.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const tasks = await fetchTaskCards();

      return res.status(200).json({
        message: 'Tasks retrieved successfully.',
        tasks,
      });
    } catch (error) {
      console.error('Error retrieving tasks:', error);
      return res.status(500).json({ error: 'Failed to retrieve tasks.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
