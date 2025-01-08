//api/task.js
import { insertTaskDependency, fetchTaskDependencies, fetchTaskCards } from '../../lib/db';

// Add a task dependency
export async function addTaskDependency(req, res) {
  try {
    const { subtaskId, dependsOn } = req.body;

    // Input validation
    if (!subtaskId || !dependsOn) {
      return res.status(400).json({ error: 'Invalid input. Both subtaskId and dependsOn are required.' });
    }

    const dependency = await insertTaskDependency({ subtaskId, dependsOn });
    res.status(200).json({
      message: 'Task dependency added successfully.',
      dependency,
    });
  } catch (error) {
    console.error('Error adding task dependency:', error);
    res.status(500).json({ error: error.message });
  }
}

// Fetch task dependencies
export async function getTaskDependencies(req, res) {
  try {
    const { subtaskId } = req.params;

    // Input validation
    if (!subtaskId) {
      return res.status(400).json({ error: 'Invalid input. subtaskId is required.' });
    }

    const dependencies = await fetchTaskDependencies(subtaskId);
    res.status(200).json({
      message: 'Task dependencies fetched successfully.',
      dependencies,
    });
  } catch (error) {
    console.error('Error fetching task dependencies:', error);
    res.status(500).json({ error: error.message });
  }
}

// Fetch a task card with subtasks and dependencies
export async function getTaskCard(req, res) {
  try {
    const { taskCardId } = req.params;

    // Input validation
    if (!taskCardId) {
      return res.status(400).json({ error: 'Invalid input. taskCardId is required.' });
    }

    const taskCard = await fetchTaskCards(taskCardId);
    res.status(200).json({
      message: 'Task card fetched successfully.',
      taskCard,
    });
  } catch (error) {
    console.error('Error fetching task card:', error);
    res.status(500).json({ error: error.message });
  }
}
