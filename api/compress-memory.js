const { compressMemory } = require('../src/actions/memory_compressor');

module.exports = async (req, res) => {
  try {
    const { memory } = req.body;
    const result = compressMemory(memory);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in compress-memory:", error);
    res.status(500).json({ error: "Failed to compress memory." });
  }
};
