// api/task/create.js
import { insertTaskCard, insertSubtasks } from '../../lib/db.js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { goal, priority, subtasks } = req.body;

    // Validate input
    if (!goal || !Array.isArray(subtasks)) {
      return res.status(400).json({ error: 'Invalid input: goal and subtasks are required.' });
    }

    try {
      // Create the task card
      const taskCard = await insertTaskCard({ goal, priority });

      // Insert subtasks associated with the task card
      const createdSubtasks = await insertSubtasks({
        taskCardId: taskCard.id,
        subtasks,
      });

      return res.status(201).json({
        message: 'Task card and subtasks created successfully.',
        taskCard,
        subtasks: createdSubtasks,
      });
    } catch (error) {
      console.error('Error creating task:', error);
      return res.status(500).json({ error: 'Failed to create task card and subtasks.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
