// api/task.js
import express from 'express';
import { insertTaskDependency, fetchTaskDependencies, fetchTaskCards } from '../lib/db.js';
import { sessionContext } from '../middleware/sessionContext.js';

const router = express.Router();

// ✅ Enhanced Circular Dependency Checker
async function hasCircularDependency(subtaskId, dependsOn) {
  const dependencies = await fetchTaskDependencies(dependsOn);
  return dependencies.some(dep => dep.depends_on === subtaskId || hasCircularDependency(subtaskId, dep.depends_on));
}

// ✅ Add a Task Dependency
router.post('/add-dependency', sessionContext, async (req, res) => {
  try {
    const { subtaskId, dependsOn } = req.body;
    const { userId, chatroomId } = req.session;

    // ⚠️ Input validation
    if (!subtaskId || !dependsOn) {
      return res.status(400).json({ error: 'Both subtaskId and dependsOn are required.' });
    }

    if (subtaskId === dependsOn) {
      return res.status(400).json({ error: 'A subtask cannot depend on itself.' });
    }

    // 🔄 Check for circular dependencies
    if (await hasCircularDependency(subtaskId, dependsOn)) {
      return res.status(400).json({ error: 'Circular dependency detected.' });
    }

    // Add your task dependency logic here

  } catch (error) {
    console.error("❌ Error in add-dependency handler:", error);
    res.status(500).json({ error: "Failed to add task dependency.", details: error.message });
  }
});

// ✅ Fetch Task Dependencies
router.get('/dependencies/:subtaskId', sessionContext, async (req, res) => {
  const { subtaskId } = req.params;
  const { userId, chatroomId } = req.session;

  try {
    if (!subtaskId) {
      return res.status(400).json({ error: 'subtaskId is required.' });
    }

    // ✅ Fetch dependencies with validation
    const dependencies = await fetchTaskDependencies(subtaskId);
    if (!dependencies) {
      return res.status(404).json({ error: 'No dependencies found for the provided subtaskId.' });
    }

    // ✅ Validate pagination parameters
    const limit = Math.max(1, Math.min(parseInt(req.query.limit) || 10, 50));
    const offset = Math.max(0, parseInt(req.query.offset) || 0);

    res.status(200).json({
      message: 'Task dependencies fetched successfully.',
      dependencies: dependencies.slice(offset, offset + limit),
      totalDependencies: dependencies.length,
    });

  } catch (error) {
    console.error('❌ Error fetching task dependencies:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Fetch Task Card with Subtasks and Dependencies
router.get('/task-card/:taskCardId', sessionContext, async (req, res) => {
  const { taskCardId } = req.params;
  const { userId, chatroomId } = req.session;

  try {
    if (!taskCardId) {
      return res.status(400).json({ error: 'taskCardId is required.' });
    }

    // 🔍 Fetch task card securely
    const taskCard = await fetchTaskCards(taskCardId, userId, chatroomId);
    if (!taskCard) {
      return res.status(404).json({ error: 'Task card not found.' });
    }

    const formattedSubtasks = taskCard.subtasks?.map(subtask => ({
      id: subtask.id,
      description: subtask.description,
      status: subtask.status,
      dependencies: subtask.task_dependencies?.map(dep => ({
        id: dep.id,
        dependsOn: dep.depends_on
      })) || [],
    })) || [];

    res.status(200).json({
      message: 'Task card fetched successfully.',
      taskCard: {
        id: taskCard.id,
        goal: taskCard.goal,
        priority: taskCard.priority,
        createdAt: taskCard.created_at,
        subtasks: formattedSubtasks,
      },
    });

  } catch (error) {
    console.error('❌ Error fetching task card:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
