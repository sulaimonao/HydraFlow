// compress-memory.js

import { compressMemory } from '../utils/memoryUtils.js';

export default async function handler(req, res) {
  try {
    const { gaugeMetrics, memory } = req.body;

    // Validate the required data
    if (!gaugeMetrics || !memory) {
      return res.status(400).json({ error: 'Gauge metrics and memory data are required for compression.' });
    }

    // Proceed with memory compression
    const result = compressMemory(memory, gaugeMetrics);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in compress-memory:", error);
    res.status(500).json({ error: error.message });
  }
}
