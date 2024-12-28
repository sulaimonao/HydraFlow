// api/task/delete.js
import { deleteTaskCard } from '../../lib/db.js';

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    const { taskCardId } = req.body;

    // Validate input
    if (!taskCardId) {
      return res.status(400).json({ error: 'Invalid input: taskCardId is required.' });
    }

    try {
      const deletedTaskCard = await deleteTaskCard({ taskCardId });

      return res.status(200).json({
        message: 'Task card deleted successfully.',
        taskCard: deletedTaskCard,
      });
    } catch (error) {
      console.error('Error deleting task card:', error);
      return res.status(500).json({ error: 'Failed to delete task card.' });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
