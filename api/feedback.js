// api/feedback.js

import supabase, { supabaseRequest, setSessionContext } from '../lib/supabaseClient.js';
import { orchestrateContextWorkflow } from '../src/logic/workflow_manager.js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    return submitFeedback(req, res);
  } else if (req.method === 'GET') {
    const { type } = req.query;
    if (type === 'summary') {
      return getFeedbackSummary(req, res);
    } else if (type === 'all') {
      return getAllFeedback(req, res);
    } else if (type === 'task') {
      return getFeedbackByTask(req, res);
    } else if (type === 'persona') {
      return getFeedbackByPersona(req, res);
    } else {
      return res.status(400).json({ error: 'Invalid feedback type.' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed.' });
  }
}

async function submitFeedback(req, res) {
  const { query, chatroom_id, responseNumber, userFeedback, rating } = req.body;

  const workflowContext = await orchestrateContextWorkflow({ query, req });
  const persistentUserId = workflowContext.generatedIdentifiers.user_id;
  const persistentChatroomId = workflowContext.generatedIdentifiers.chatroom_id;

  await setSessionContext(persistentUserId, persistentChatroomId);

  if (!persistentChatroomId || responseNumber === undefined || !userFeedback) {
    return res.status(400).json({ error: 'chatroom_id, responseNumber, and userFeedback are required.' });
  }

  const responseId = `${persistentChatroomId}_${responseNumber}`;

  try {
    const data = await supabaseRequest(
      () => supabase.from('feedback_entries').insert([
        { response_id: responseId, user_feedback: userFeedback, rating, user_id: persistentUserId, chatroom_id: persistentChatroomId }
      ])
    );

    await improveWorkflowsBasedOnFeedback(userFeedback, rating);

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error inserting feedback:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function improveWorkflowsBasedOnFeedback(userFeedback, rating) {
  if (rating < 3) {
    console.log('Adjusting workflow based on negative feedback:', userFeedback);
  }
}

async function getFeedbackSummary(req, res) {
  try {
    const data = await supabaseRequest(() => supabase.from('feedback_entries').select('rating'));
    const averageRating = data.reduce((acc, entry) => acc + entry.rating, 0) / data.length;
    return res.status(200).json({ averageRating });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function getAllFeedback(req, res) {
  try {
    const data = await supabaseRequest(() => supabase.from('feedback_entries').select('*'));
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function getFeedbackByTask(req, res) {
  const { taskId } = req.query;
  try {
    const data = await supabaseRequest(() => supabase.from('feedback_entries').select('*').eq('task_id', taskId));
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function getFeedbackByPersona(req, res) {
  const { personaId } = req.query;
  try {
    const data = await supabaseRequest(() => supabase.from('feedback_entries').select('*').eq('persona_id', personaId));
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
