// api/task.js

import { insertTaskDependency, fetchTaskDependencies, fetchTaskCards } from '../lib/db.js';
import supabase, { supabaseRequest, setSessionContext } from '../lib/supabaseClient.js';
import { orchestrateContextWorkflow } from '../src/logic/workflow_manager.js';

// Add a task dependency
export async function addTaskDependency(req, res) {
  try {
    const { query } = req.body;

    // ✅ Generate persistent IDs
    const workflowContext = await orchestrateContextWorkflow({ query });
    const persistentUserId = workflowContext.generatedIdentifiers.user_id;
    const persistentChatroomId = workflowContext.generatedIdentifiers.chatroom_id;

    // 🔐 Set session context for RLS
    await setSessionContext(persistentUserId, persistentChatroomId);

    const { subtaskId, dependsOn } = req.body;

    // ⚠️ Input validation
    if (!subtaskId || !dependsOn) {
      return res.status(400).json({ error: 'Invalid input. Both subtaskId and dependsOn are required.' });
    }

    if (subtaskId === dependsOn) {
      return res.status(400).json({ error: 'A subtask cannot depend on itself.' });
    }

    // 🔄 Check for circular dependencies
    const existingDependencies = await fetchTaskDependencies(subtaskId);
    if (existingDependencies.some(dep => dep.depends_on === dependsOn)) {
      return res.status(400).json({ error: 'Circular dependency detected.' });
    }

    // ✅ Insert dependency
    const dependency = await insertTaskDependency({
      subtaskId,
      dependsOn,
      user_id: persistentUserId,
      chatroom_id: persistentChatroomId,
    });

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
    const { query } = req.body;

    // ✅ Generate persistent IDs
    const workflowContext = await orchestrateContextWorkflow({ query });
    const persistentUserId = workflowContext.generatedIdentifiers.user_id;
    const persistentChatroomId = workflowContext.generatedIdentifiers.chatroom_id;

    // 🔐 Set session context for RLS
    await setSessionContext(persistentUserId, persistentChatroomId);

    const { subtaskId } = req.params;

    if (!subtaskId) {
      return res.status(400).json({ error: 'Invalid input. subtaskId is required.' });
    }

    const dependencies = await fetchTaskDependencies(subtaskId);

    const { limit = 10, offset = 0 } = req.query;
    const paginatedDependencies = dependencies.slice(offset, offset + limit);

    res.status(200).json({
      message: 'Task dependencies fetched successfully.',
      dependencies: paginatedDependencies,
      totalDependencies: dependencies.length,
    });

  } catch (error) {
    console.error('Error fetching task dependencies:', error);
    res.status(500).json({ error: error.message });
  }
}

// Fetch a task card with subtasks and dependencies
export async function getTaskCard(req, res) {
  try {
    const { query } = req.body;

    // ✅ Generate persistent IDs
    const workflowContext = await orchestrateContextWorkflow({ query });
    const persistentUserId = workflowContext.generatedIdentifiers.user_id;
    const persistentChatroomId = workflowContext.generatedIdentifiers.chatroom_id;

    // 🔐 Set session context for RLS
    await setSessionContext(persistentUserId, persistentChatroomId);

    const { taskCardId } = req.params;

    if (!taskCardId) {
      return res.status(400).json({ error: 'Invalid input. taskCardId is required.' });
    }

    // 🔍 Fetch task card securely
    const taskCard = await fetchTaskCards(taskCardId, persistentUserId, persistentChatroomId);

    const filteredSubtasks = taskCard.subtasks?.map(subtask => ({
      id: subtask.id,
      description: subtask.description,
      status: subtask.status,
      dependencies: subtask.task_dependencies?.map(dep => ({
        id: dep.id,
        dependsOn: dep.depends_on
      }))
    })) || [];

    res.status(200).json({
      message: 'Task card fetched successfully.',
      taskCard: {
        id: taskCard.id,
        goal: taskCard.goal,
        priority: taskCard.priority,
        createdAt: taskCard.created_at,
        subtasks: filteredSubtasks,
      },
    });

  } catch (error) {
    console.error('Error fetching task card:', error);
    res.status(500).json({ error: error.message });
  }
}
