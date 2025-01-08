// api/feedback/all.js
import supabase from '../../lib/supabaseClient';

export default async function handler(req, res) {
  try {
    const { user_id, chatroom_id } = req.query;

    // Build query dynamically based on optional filters
    let query = supabase.from('feedback_entries').select('*');
    if (user_id) query = query.eq('user_id', user_id);
    if (chatroom_id) query = query.eq('chatroom_id', chatroom_id);

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
