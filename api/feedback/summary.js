// api/feedback/summary.js

import supabase from '../../lib/supabaseClient';

export default async function handler(req, res) {
  try {
    // Fetch summarized feedback data
    const { data, error } = await supabase
      .from('feedback_entries')
      .select('rating');

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
      gaugeMetrics: res.locals.gaugeMetrics, // Include gauge metrics in the response
      message: 'Feedback summary retrieved successfully.',
    });
  } catch (error) {
    console.error('Error retrieving feedback summary:', error);
    res.status(500).json({ error: 'Failed to retrieve feedback summary.' });
  }
}
