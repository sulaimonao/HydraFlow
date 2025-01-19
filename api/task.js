// api/task.js
import { insertTaskDependency, fetchTaskDependencies, fetchTaskCards } from '../lib/db.js';
import { orchestrateContextWorkflow } from '../src/logic/workflow_manager.js';
import { sessionContext } from '../middleware/sessionContext.js';

// ✅ Enhanced Circular Dependency Checker
async function hasCircularDependency(subtaskId, dependsOn) {
  const dependencies = await fetchTaskDependencies(dependsOn);
  return dependencies.some(dep => dep.depends_on === subtaskId || hasCircularDependency(subtaskId, dep.depends_on));
}

// ✅ Add a Task Dependency
async function addTaskDependency(req, res) {
  sessionContext(req, res, async () => {
    const { subtaskId, dependsOn } = req.body;
    const { userId, chatroomId } = req.locals;

    try {
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

      // ✅ Insert dependency
      const { data, error } = await insertTaskDependency({
        subtaskId,
        dependsOn,
        user_id: userId,
        chatroom_id: chatroomId,
      });

      if (error) {
        throw new Error(`Failed to insert dependency: ${error.message}`);
      }

      res.status(200).json({
        message: 'Task dependency added successfully.',
        dependency: data,
      });

    } catch (error) {
      console.error('❌ Error adding task dependency:', error);
      res.status(500).json({ error: error.message });
    }
  });
}

// ✅ Fetch Task Dependencies
async function getTaskDependencies(req, res) {
  sessionContext(req, res, async () => {
    const { subtaskId } = req.params;
    const { userId, chatroomId } = req.locals;

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
}

// ✅ Fetch Task Card with Subtasks and Dependencies
async function getTaskCard(req, res) {
  sessionContext(req, res, async () => {
    const { taskCardId } = req.params;
    const { userId, chatroomId } = req.locals;

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
}

export {
  addTaskDependency,
  getTaskDependencies,
  getTaskCard
};
