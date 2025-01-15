// api/feedback.js
import supabase, { supabaseRequest, setSessionContext } from '../lib/supabaseClient.js';
import { orchestrateContextWorkflow } from '../src/logic/workflow_manager.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      return await submitFeedback(req, res);
    } else if (req.method === 'GET') {
      return await handleGetFeedback(req, res);
    } else {
      return res.status(405).json({ error: 'Method not allowed.' });
    }
  } catch (error) {
    console.error("❌ Error in feedback handler:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}

/**
 * Handles GET feedback requests by type.
 */
async function handleGetFeedback(req, res) {
  const { type } = req.query;

  switch (type) {
    case 'summary':
      return await getFeedbackSummary(req, res);
    case 'all':
      return await getAllFeedback(req, res);
    case 'task':
      return await getFeedbackByTask(req, res);
    case 'persona':
      return await getFeedbackByPersona(req, res);
    default:
      return res.status(400).json({ error: 'Invalid feedback type.' });
  }
}

/**
 * Handles feedback submission.
 */
async function submitFeedback(req, res) {
  const { query, responseNumber, userFeedback, rating } = req.body;

  if (!userFeedback || typeof userFeedback !== 'string') {
    return res.status(400).json({ error: "'userFeedback' must be a non-empty string." });
  }

  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "'rating' must be a number between 1 and 5." });
  }

  try {
    const workflowContext = await orchestrateContextWorkflow({ query, req });
    const persistentUserId = workflowContext.generatedIdentifiers.user_id;
    const persistentChatroomId = workflowContext.generatedIdentifiers.chatroom_id;

    if (!persistentUserId || !persistentChatroomId) {
      return res.status(400).json({ error: 'Invalid user or chatroom identifiers.' });
    }

    await setSessionContext(persistentUserId, persistentChatroomId);

    const responseId = `${persistentChatroomId}_${responseNumber}`;

    const { data, error } = await supabase
      .from('feedback_entries')
      .insert([
        {
          response_id: responseId,
          user_feedback: userFeedback,
          rating,
          user_id: persistentUserId,
          chatroom_id: persistentChatroomId,
          created_at: new Date().toISOString()
        }
      ]);

    if (error) {
      throw new Error(`Failed to insert feedback: ${error.message}`);
    }

    await improveWorkflowsBasedOnFeedback(userFeedback, rating);

    return res.status(200).json({ message: "Feedback submitted successfully.", data });
  } catch (error) {
    console.error("❌ Error in submitFeedback:", error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Adjust workflows based on feedback.
 */
async function improveWorkflowsBasedOnFeedback(userFeedback, rating) {
  if (rating < 3) {
    console.warn("⚠️ Negative feedback received. Adjusting workflows:", userFeedback);
  }
}

/**
 * Provides feedback summary with average rating.
 */
async function getFeedbackSummary(req, res) {
  try {
    const { data, error } = await supabase
      .from('feedback_entries')
      .select('rating');

    if (error) {
      throw new Error(`Failed to fetch feedback summary: ${error.message}`);
    }

    if (data.length === 0) {
      return res.status(200).json({ averageRating: 0, message: "No feedback data available." });
    }

    const totalRating = data.reduce((sum, entry) => sum + entry.rating, 0);
    const averageRating = (totalRating / data.length).toFixed(2);

    return res.status(200).json({ averageRating });
  } catch (error) {
    console.error("❌ Error in getFeedbackSummary:", error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Retrieves all feedback entries.
 */
async function getAllFeedback(req, res) {
  try {
    const { data, error } = await supabase
      .from('feedback_entries')
      .select('*');

    if (error) {
      throw new Error(`Failed to fetch all feedback: ${error.message}`);
    }

    return res.status(200).json({ message: "All feedback retrieved.", data });
  } catch (error) {
    console.error("❌ Error in getAllFeedback:", error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Fetches feedback by task ID.
 */
async function getFeedbackByTask(req, res) {
  const { taskId } = req.query;

  if (!taskId) {
    return res.status(400).json({ error: "taskId is required." });
  }

  try {
    const { data, error } = await supabase
      .from('feedback_entries')
      .select('*')
      .eq('task_id', taskId);

    if (error) {
      throw new Error(`Failed to fetch task feedback: ${error.message}`);
    }

    return res.status(200).json({ message: "Task feedback retrieved.", data });
  } catch (error) {
    console.error("❌ Error in getFeedbackByTask:", error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Fetches feedback by persona ID.
 */
async function getFeedbackByPersona(req, res) {
  const { personaId } = req.query;

  if (!personaId) {
    return res.status(400).json({ error: "personaId is required." });
  }

  try {
    const { data, error } = await supabase
      .from('feedback_entries')
      .select('*')
      .eq('persona_id', personaId);

    if (error) {
      throw new Error(`Failed to fetch persona feedback: ${error.message}`);
    }

    return res.status(200).json({ message: "Persona feedback retrieved.", data });
  } catch (error) {
    console.error("❌ Error in getFeedbackByPersona:", error);
    return res.status(500).json({ error: error.message });
  }
}
