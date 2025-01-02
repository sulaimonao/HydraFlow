// api/utils.js
import { compressMemory, contextRecap } from "../src/actions";
import { logInfo, logError } from "../src/util";

export default async function handler(req, res) {
  try {
    const { action } = req.query;

    if (!action) {
      return res.status(400).json({ error: 'Action query parameter is required. Use "compress" or "recap".' });
    }

    if (action === "compress") {
      const { memory } = req.body;

      // Validate input
      if (!memory || typeof memory !== "string") {
        return res.status(400).json({ error: "A valid memory string is required for compression." });
      }

      // Perform memory compression
      const { compressedMemory } = compressMemory(memory);

      logInfo("Memory successfully compressed.");
      return res.status(200).json({ compressedMemory, message: "Memory compressed successfully." });
    } else if (action === "recap") {
      const { history, compressedMemory } = req.body;

      // Validate input
      if (!history || !Array.isArray(history)) {
        return res.status(400).json({ error: "A valid history array is required for context recap." });
      }

      if (!compressedMemory || typeof compressedMemory !== "string") {
        return res.status(400).json({ error: "A valid compressed memory string is required for context recap." });
      }

      // Perform context recap
      const recap = await contextRecap(history, compressedMemory);

      logInfo("Context recap generated successfully.");
      return res.status(200).json({ recap, message: "Context recap generated successfully." });
    } else {
      return res.status(400).json({ error: 'Invalid action. Use "compress" or "recap".' });
    }
  } catch (error) {
    logError(`Error in utils API: ${error.message}`);
    res.status(500).json({ error: "Internal server error. Please try again." });
  }
}
