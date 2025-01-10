// api/compress-memory.js
import { compressMemory } from "../src/actions/memory_compressor.js";
import supabase, { supabaseRequest } from '../lib/supabaseClient.js';

export default async (req, res) => {
  try {
    // Destructure memory, threshold, and data from the request body
    const { memory, threshold, data } = req.body;

    // Input validation
    if (!memory || typeof memory !== "string") {
      return res.status(400).json({ error: "A valid memory string is required." });
    }

    if (threshold !== undefined && typeof threshold !== "number") {
      return res.status(400).json({ error: "Threshold must be a number if provided." });
    }

    // Fallback for gauge metrics
    const gaugeMetrics = data?.gaugeMetrics ?? [];
    if (!gaugeMetrics.length) {
      console.warn("No gauge metrics available for compression.");
    }

    // Perform memory compression with optional threshold
    const compressedMemory = compressMemory(memory, threshold);

    // Respond with compressed memory, additional metrics, and gauge metrics
    return res.status(200).json({
      compressedMemory, 
      originalLength: memory.length,
      compressedLength: compressedMemory.length,
      compressionRatio: (compressedMemory.length / memory.length).toFixed(2),
      gaugeMetrics
    });
  } catch (error) {
    console.error("Error in compress-memory:", error);
    res.status(500).json({ error: error.message });
  }
};
