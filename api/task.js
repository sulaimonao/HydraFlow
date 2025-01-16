// api/task.js
import { insertTaskDependency, fetchTaskDependencies, fetchTaskCards } from '../lib/db.js';
import { setSessionContext } from '../lib/supabaseClient.js';
import { orchestrateContextWorkflow } from '../src/logic/workflow_manager.js';

// ✅ Enhanced Circular Dependency Checker
async function hasCircularDependency(subtaskId, dependsOn) {
  const dependencies = await fetchTaskDependencies(dependsOn);
  return dependencies.some(dep => dep.depends_on === subtaskId || hasCircularDependency(subtaskId, dep.depends_on));
}

// ✅ Add a Task Dependency
export async function addTaskDependency(req, res) {
  try {
    const { query, subtaskId, dependsOn } = req.body;

    // 🚀 Generate persistent IDs
    const workflowContext = await orchestrateContextWorkflow(req, {
      query: query || '',
      memory: req.body.memory || '',
      feedback: req.body.feedback || null,
      tokenCount: req.body.tokenCount || 0,
    });
    const persistentUserId = workflowContext.generatedIdentifiers.user_id;
    const persistentChatroomId = workflowContext.generatedIdentifiers.chatroom_id;

    // 🔒 Set session context for RLS
    await setSessionContext(persistentUserId, persistentChatroomId);

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
      user_id: persistentUserId,
      chatroom_id: persistentChatroomId,
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
}

// ✅ Fetch Task Dependencies
export async function getTaskDependencies(req, res) {
  try {
    const { query } = req.body;
    const { subtaskId } = req.params;

    // 🚀 Generate persistent IDs
    const workflowContext = await orchestrateContextWorkflow(req, {
      query: query || '',
      memory: req.body.memory || '',
      feedback: req.body.feedback || null,
      tokenCount: req.body.tokenCount || 0,
    });
    const persistentUserId = workflowContext.generatedIdentifiers.user_id;
    const persistentChatroomId = workflowContext.generatedIdentifiers.chatroom_id;

    // 🔒 Set session context for RLS
    await setSessionContext(persistentUserId, persistentChatroomId);

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
}

// ✅ Fetch Task Card with Subtasks and Dependencies
export async function getTaskCard(req, res) {
  try {
    const { query } = req.body;
    const { taskCardId } = req.params;

    // 🚀 Generate persistent IDs
    const workflowContext = await orchestrateContextWorkflow(req, {
      query: query || '',
      memory: req.body.memory || '',
      feedback: req.body.feedback || null,
      tokenCount: req.body.tokenCount || 0,
    });
    const persistentUserId = workflowContext.generatedIdentifiers.user_id;
    const persistentChatroomId = workflowContext.generatedIdentifiers.chatroom_id;

    // 🔒 Set session context for RLS
    await setSessionContext(persistentUserId, persistentChatroomId);

    if (!taskCardId) {
      return res.status(400).json({ error: 'taskCardId is required.' });
    }

    // 🔍 Fetch task card securely
    const taskCard = await fetchTaskCards(taskCardId, persistentUserId, persistentChatroomId);
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
}
