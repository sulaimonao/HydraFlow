import { calculateMetrics } from '../../src/util/metrics';

export default async function handler(req, res) {
  try {
    const { tokenUsage, responseLatency } = req.body;

    if (!tokenUsage || !responseLatency) {
      return res.status(400).json({ error: 'Missing required parameters.' });
    }

    const context = {
      tokenUsage,
      responseLatency,
    };

    const metrics = calculateMetrics(context);
    res.status(200).json(metrics);
  } catch (error) {
    console.error('Error fetching gauge metrics:', error);
    res.status(500).json({ error: 'Failed to fetch gauge metrics.' });
  }
}