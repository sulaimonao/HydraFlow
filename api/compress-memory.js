// api/compress-memory.js
import { compressMemory } from "../src/actions/memory_compressor.js";
import supabase, { supabaseRequest } from '../lib/supabaseClient.js';

export default async function handler(req, res) {
  try {
    const { gaugeMetrics } = req.body;
    if (!gaugeMetrics) {
      return res.status(400).json({ error: 'Gauge metrics data is required for compression.' });
    }

    const result = compressMemory(gaugeMetrics);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in compress-memory:", error);
    res.status(500).json({ error: error.message });
  }
}
