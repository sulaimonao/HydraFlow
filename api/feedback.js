// api/feedback.js
import supabase from '../../lib/supabaseClient';

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
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function submitFeedback(req, res) {
  const { user_id, chatroom_id, userFeedback, rating, response_id } = req.body;

  if (!userFeedback || typeof userFeedback !== 'string' || !rating || isNaN(rating)) {
    return res.status(400).json({ error: 'Invalid input. Please provide valid feedback and rating.' });
  }

  try {
    const { data, error } = await supabase
      .from('feedback_entries')
      .insert([{ user_id, chatroom_id, user_feedback: userFeedback, rating, response_id }]);

    if (error) {
      throw new Error(`Error submitting feedback: ${error.message}`);
    }

    res.status(200).json({ message: 'Feedback submitted successfully.', data });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Unexpected error occurred.' });
  }
}

async function getFeedbackSummary(req, res) {
  const { user_id, chatroom_id } = req.query;

  let query = supabase.from('feedback_entries').select('rating');
  if (user_id) query = query.eq('user_id', user_id);
  if (chatroom_id) query = query.eq('chatroom_id', chatroom_id);

  try {
    const { data, error } = await query;
    if (error) {
      throw new Error(`Error fetching feedback summary: ${error.message}`);
    }

    const totalFeedback = data.length;
    const averageRating = totalFeedback > 0 
      ? (data.reduce((sum, entry) => sum + entry.rating, 0) / totalFeedback).toFixed(2) 
      : 0;

    res.status(200).json({
      totalFeedback,
      averageRating,
      message: 'Feedback summary retrieved successfully.',
    });
  } catch (error) {
    console.error('Error retrieving feedback summary:', error);
    res.status(500).json({ error: 'Failed to retrieve feedback summary.' });
  }
}

async function getAllFeedback(req, res) {
  const { user_id, chatroom_id } = req.query;

  let query = supabase.from('feedback_entries').select('*');
  if (user_id) query = query.eq('user_id', user_id);
  if (chatroom_id) query = query.eq('chatroom_id', chatroom_id);

  try {
    const { data, error } = await query;
    if (error) {
      throw new Error(`Error fetching feedback: ${error.message}`);
    }

    res.status(200).json({
      status: 'success',
      data,
    });
  } catch (error) {
    console.error('Error retrieving all feedback:', error);
    res.status(500).json({ error: 'Failed to retrieve feedback data.' });
  }
}

async function getFeedbackByTask(req, res) {
  const { taskId } = req.query;

  try {
    const taskFeedback = await supabase
      .from('feedback_entries')
      .select('*')
      .eq('task_id', taskId);

    res.status(200).json({ status: 'success', data: taskFeedback });
  } catch (error) {
    console.error('Error retrieving task feedback:', error);
    res.status(500).json({ error: 'Failed to retrieve task-specific feedback.' });
  }
}

async function getFeedbackByPersona(req, res) {
  const { personaName } = req.query;

  try {
    const personaFeedback = await supabase
      .from('feedback_entries')
      .select('*')
      .eq('persona', personaName);

    res.status(200).json({ status: 'success', data: personaFeedback });
  } catch (error) {
    console.error('Error retrieving persona feedback:', error);
    res.status(500).json({ error: 'Failed to retrieve persona-specific feedback.' });
  }
}