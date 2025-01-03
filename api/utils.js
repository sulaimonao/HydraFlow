// api/utils.js
import { compressMemory, contextRecap } from "../src/actions/index.js";
import { logInfo, logError } from "../src/util/index.js";

export default async function handler(req, res) {
  try {
    const { action } = req.query;

    if (!action) {
      logError("Action query parameter is missing.");
      return res.status(400).json({ error: 'Action query parameter is required. Use "compress" or "recap".' });
    }

    if (action === "compress") {
      const { memory } = req.body;

      if (!memory || typeof memory !== "string") {
        logError("Invalid memory input for compression.");
        return res.status(400).json({ error: "A valid memory string is required for compression." });
      }

      const { compressedMemory } = compressMemory(memory);
      logInfo("Memory successfully compressed.");
      return res.status(200).json({ compressedMemory, message: "Memory compressed successfully." });
    }

    if (action === "recap") {
      const { history, compressedMemory } = req.body;

      if (!Array.isArray(history) || typeof compressedMemory !== "string") {
        logError("Invalid input for context recap.");
        return res.status(400).json({
          error: "Valid history array and compressed memory string are required for context recap.",
        });
      }

      const recap = await contextRecap(history, compressedMemory);
      logInfo("Context recap generated successfully.");
      return res.status(200).json({ recap, message: "Context recap generated successfully." });
    }

    logError(`Invalid action: ${action}`);
    return res.status(400).json({ error: 'Invalid action. Use "compress" or "recap".' });
  } catch (error) {
    logError(`Error in utils API: ${error.message}`);
    return res.status(500).json({ error: "Internal server error. Please try again." });
  }
}
