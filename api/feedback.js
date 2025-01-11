// api/feedback.js

import supabase, { supabaseRequest } from '../lib/supabaseClient.js';

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
  const { chatroom_id, responseNumber, userFeedback, rating } = req.body;

  if (!chatroom_id || responseNumber === undefined || !userFeedback) {
    return res.status(400).json({ error: 'chatroom_id, responseNumber, and userFeedback are required.' });
  }

  const responseId = `${chatroom_id}_${responseNumber}`;

  console.log('Inserting feedback:', { responseId, userFeedback, rating });

  try {
    const data = await supabaseRequest(
      () => supabase.from('feedback_entries').insert([{ response_id: responseId, user_feedback: userFeedback, rating }])
    );

    // Use feedback to improve workflows
    await improveWorkflowsBasedOnFeedback(userFeedback, rating);

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error inserting feedback:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function improveWorkflowsBasedOnFeedback(userFeedback, rating) {
  // Analyze feedback and adjust workflows dynamically
  if (rating < 3) {
    // Example: Adjust workflow if feedback is negative
    console.log('Adjusting workflow based on negative feedback:', userFeedback);
    // Implement logic to adjust workflows based on feedback
  }
}

async function getFeedbackSummary(req, res) {
  try {
    const data = await supabaseRequest(() => supabase.from('feedback_entries').select('rating')
    );
    const averageRating = data.reduce((acc, entry) => acc + entry.rating, 0) / data.length;
    return res.status(200).json({ averageRating });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function getAllFeedback(req, res) {
  try {
    const data = await supabaseRequest(() => supabase.from('feedback_entries').select('*')
    );
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function getFeedbackByTask(req, res) {
  const { taskId } = req.query;

  try {
    const data = await supabaseRequest(() => supabase.from('feedback_entries').select('*').eq('task_id', taskId)
    );
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function getFeedbackByPersona(req, res) {
  const { personaId } = req.query;

  try {
    const data = await supabase
      .from('feedback_entries')
      .select('*')
      .eq('persona_id', personaId);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}