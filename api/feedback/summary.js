// api/feedback/summary.js
import supabase from '../../lib/supabaseClient';

export default async function handler(req, res) {
  try {
    const { user_id, chatroom_id } = req.query;

    // Build query dynamically based on optional filters
    let query = supabase.from('feedback_entries').select('rating');
    if (user_id) query = query.eq('user_id', user_id);
    if (chatroom_id) query = query.eq('chatroom_id', chatroom_id);

    const { data, error } = await query;
    if (error) {
      throw new Error(`Error fetching feedback summary: ${error.message}`);
    }

    // Calculate summary metrics
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
