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

    // Fallback for gauge metrics
    const gaugeMetrics = res.locals.gaugeMetrics || {}; // Default to an empty object if undefined

    // Log a warning if gauge metrics are missing
    if (!res.locals.gaugeMetrics) {
      console.warn("Warning: gaugeMetrics is missing. Using default values.");
    }

    // Respond with the summary and gauge metrics
    res.status(200).json({
      totalFeedback,
      averageRating,
      gaugeMetrics,
      message: 'Feedback summary retrieved successfully.',
    });
  } catch (error) {
    console.error('Error retrieving feedback summary:', error);
    res.status(500).json({ error: 'Failed to retrieve feedback summary.' });
  }
}
