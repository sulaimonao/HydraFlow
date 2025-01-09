// api/compress-memory.js
import { compressMemory } from "../src/actions/memory_compressor.js";
import supabase, { supabaseRequest } from '../../lib/supabaseClient';

export default async (req, res) => {
  try {
    const { memory, threshold } = req.body;

    // Input validation
    if (!memory || typeof memory !== "string") {
      return res.status(400).json({ error: "A valid memory string is required." });
    }

    if (threshold !== undefined && typeof threshold !== "number") {
      return res.status(400).json({ error: "Threshold must be a number if provided." });
    }

    // Perform memory compression with optional threshold
    const compressedMemory = compressMemory(memory, threshold);

    // Fallback for gauge metrics
    const gaugeMetrics = res.locals.gaugeMetrics || {}; // Default to an empty object if undefined

    // Log a warning if gauge metrics are missing
    if (!res.locals.gaugeMetrics) {
      console.warn("Warning: gaugeMetrics is missing. Using default values.");
    }

    // Respond with compressed memory, additional metrics, and gauge metrics
    return res.status(200).json({
      compressedMemory,
      originalLength: memory.length,
      compressedLength: compressedMemory.length,
      compressionRatio: (compressedMemory.length / memory.length).toFixed(2),
      gaugeMetrics,
      message: "Memory compressed successfully."
    });
  } catch (error) {
    console.error("Error in compress-memory:", error);
    return res.status(500).json({ error: "Failed to compress memory. Please try again." });
  }
};
