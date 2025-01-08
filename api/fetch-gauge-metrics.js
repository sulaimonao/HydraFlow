// api/fetch-gauge-metrics.js
import { calculateMetrics } from '../../src/util/metrics';

export default async function handler(req, res) {
  try {
    const { tokenUsage, responseLatency, activeSubpersonas } = req.body;

    // Validate required parameters
    if (!tokenUsage || !responseLatency) {
      return res.status(400).json({ error: 'Missing required parameters: tokenUsage and responseLatency.' });
    }

    if (activeSubpersonas && !Array.isArray(activeSubpersonas)) {
      return res.status(400).json({ error: 'activeSubpersonas must be an array if provided.' });
    }

    const context = {
      tokenUsage,
      responseLatency,
      activeSubpersonas: activeSubpersonas || [],
    };

    const metrics = calculateMetrics(context);

    // Enrich metrics with additional details
    const enrichedMetrics = {
      ...metrics,
      totalSubpersonas: activeSubpersonas ? activeSubpersonas.length : 0,
      suggestions: metrics.tokenUsage.used / metrics.tokenUsage.total > 0.8
        ? ['Consider reducing token usage to optimize performance.']
        : [],
    };

    res.status(200).json(enrichedMetrics);
  } catch (error) {
    console.error('Error fetching gauge metrics:', error);
    res.status(500).json({ error: 'Failed to fetch gauge metrics.' });
  }
}