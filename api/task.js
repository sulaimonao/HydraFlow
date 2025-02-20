// api/task.js (Local SQLite Version)
import express from 'express';
// Removed Supabase imports and imports for functions that do not exist in db module
//import { insertTaskDependency, fetchTaskDependencies, fetchTaskCards } from '../lib/db.js';
import * as db from '../lib/db.js'; // Import SQLite db module
import { sessionContext } from '../middleware/sessionContext.js';

const router = express.Router();

// ✅ Enhanced Circular Dependency Checker
async function hasCircularDependency(subtaskId, dependsOn, userId, chatroomId) {
    const dependencies = await db.fetchTaskDependencies(dependsOn, userId, chatroomId);
    if (!dependencies) return false; // No dependencies, no cycle

    for (const dep of dependencies) {
        if (dep.child_subtask_id === subtaskId) {
            return true; // Direct cycle found
        }
        // Recursive check with userId and chatroomId
        if (await hasCircularDependency(subtaskId, dep.child_subtask_id, userId, chatroomId)) {
            return true; // Cycle found in deeper levels
        }
    }
    return false;
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
        // Pass userId and chatroomId to hasCircularDependency
        if (await hasCircularDependency(subtaskId, dependsOn, userId, chatroomId)) {
            return res.status(400).json({ error: 'Circular dependency detected.' });
        }

        // Add task dependency using db.insertTaskDependency
        const result = await db.insertTaskDependency(userId, chatroomId, subtaskId, dependsOn);

        res.status(201).json({ message: 'Task dependency added successfully.', data: { id: result.id } });

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

        // ✅ Fetch dependencies with validation, passing userId and chatroomId
        const dependencies = await db.fetchTaskDependencies(subtaskId, userId, chatroomId); // You need to implement this!
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

        // 🔍 Fetch task card
        const taskCard = await db.fetchTaskCardById(taskCardId, userId, chatroomId); // You need to implement this!
        if (!taskCard) {
            return res.status(404).json({ error: 'Task card not found.' });
        }
        // Fetch associated subtasks.
        const subtasks = await db.fetchSubtasksByTaskCard(userId, chatroomId, taskCardId);
        // Create array to hold formatted subtasks.
        const formattedSubtasks = [];

        if (subtasks) {
            for (const subtask of subtasks) {
                const dependencies = await db.fetchTaskDependencies(subtask.id, userId, chatroomId);
                formattedSubtasks.push({
                    id: subtask.id,
                    description: subtask.description,
                    status: subtask.status,
                    dependencies: dependencies || [], // Ensure dependencies is an array
                });
            }
        }

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