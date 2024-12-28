// api/task/update.js
import { updateSubtaskStatus } from '../../lib/db.js';

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    const { subtaskId, status } = req.body;

    // Validate input
    if (!subtaskId || !status) {
      return res.status(400).json({ error: 'Invalid input: subtaskId and status are required.' });
    }

    try {
      const updatedSubtask = await updateSubtaskStatus({ subtaskId, status });

      return res.status(200).json({
        message: 'Subtask status updated successfully.',
        subtask: updatedSubtask,
      });
    } catch (error) {
      console.error('Error updating subtask status:', error);
      return res.status(500).json({ error: 'Failed to update subtask status.' });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
