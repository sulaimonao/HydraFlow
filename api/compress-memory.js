// api/compress-memory.js

import { compressMemory } from "../src/actions/memory_compressor.js";

export default async (req, res) => {
  try {
    const { memory } = req.body;

    // Input validation
    if (!memory || typeof memory !== "string") {
      return res.status(400).json({ error: "A valid memory string is required." });
    }

    // Perform memory compression
    const compressedMemory = compressMemory(memory);

    // Respond with compressed memory
    return res.status(200).json({ compressedMemory, message: "Memory compressed successfully." });
  } catch (error) {
    console.error("Error in compress-memory:", error);
    return res.status(500).json({ error: "Failed to compress memory. Please try again." });
  }
};
