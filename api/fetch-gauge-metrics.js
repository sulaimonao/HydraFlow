// api/fetch-gauge-metrics.js
import { calculateMetrics } from '../src/util/metrics.js';
import supabase, { supabaseRequest } from '../lib/supabaseClient.js';

export default async function handler(req, res) {
  try {
    const metricType = req.query.metricType || 'default'; // Set default metricType if not provided
    let { tokenUsage, responseLatency, activeSubpersonas } = req.body;

    // Fetch dynamic token usage if not provided
    if (!tokenUsage) {
      const { data, error } = await supabase
        .from('gauge_metrics')
        .select('token_used, token_total')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        console.warn("Token usage not found. Using default values.");
        tokenUsage = { used: 0, total: 10000 }; // Default values
      } else {
        tokenUsage = { used: data.token_used, total: data.token_total };
      }
    }

    // Default response latency if not provided
    responseLatency = responseLatency || 0.5;

    // Ensure activeSubpersonas is an array
    activeSubpersonas = activeSubpersonas || [];

    const context = {
      tokenUsage,
      responseLatency,
      activeSubpersonas,
    };

    const metrics = calculateMetrics(context);

    // Enrich metrics with additional details
    const enrichedMetrics = {
      ...metrics,
      totalSubpersonas: activeSubpersonas.length,
      metricType, // Include metricType in the response
    };

    res.status(200).json(enrichedMetrics);
  } catch (error) {
    console.error("Error fetching gauge metrics:", error);
    res.status(500).json({ error: error.message });
  }
}
