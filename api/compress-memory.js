import { compressMemory } from "../src/actions/memory_compressor.js";

export default async (req, res) => {
  try {
    const { memory } = req.body;

    if (!memory) {
      return res.status(400).json({ error: "Memory is required." });
    }

    const result = compressMemory(memory);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in compress-memory:", error);
    res.status(500).json({ error: "Failed to compress memory." });
  }
};
