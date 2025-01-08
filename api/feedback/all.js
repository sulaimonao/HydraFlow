// api/feedback/all.js

import supabase from '../../lib/supabaseClient';

export default async function handler(req, res) {
  try {
    // Fetch all feedback entries from the feedback_entries table
    const { data, error } = await supabase
      .from('feedback_entries')
      .select('*');

    if (error) {
      throw new Error(`Error fetching feedback: ${error.message}`);
    }

    // Respond with feedback data and gauge metrics
    res.status(200).json({
      status: 'success',
      data,
      gaugeMetrics: res.locals.gaugeMetrics, // Include gauge metrics in the response
    });
  } catch (error) {
    console.error('Error retrieving all feedback:', error);
    res.status(500).json({ error: 'Failed to retrieve feedback data.' });
  }
}
