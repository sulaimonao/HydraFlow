// api/compress-memory.js
import { compressMemory } from "../src/actions/memory_compressor.js"; // Ensure correct path
import {
  fetchMemory,
  upsertMemory,
  logInfo,
  logError,
} from "../src/util/memory.js"; // Ensure correct path

export default async function compressMemoryHandler(req, res) {
  try {
    const { memory, user_id, chatroom_id } = req.body;

    if (!memory || typeof memory !== "string" || !user_id || !chatroom_id) {
      logError("Invalid request: Missing or incorrect fields.");
      return res.status(400).json({
        error: "A valid memory string, user_id, and chatroom_id are required.",
      });
    }

    logInfo(`Fetching memory for user ${user_id} in chatroom ${chatroom_id}`);
    const existingMemory = await fetchMemory(user_id, chatroom_id);
    const combinedMemory = `${existingMemory || ""} ${memory}`.trim();

    const compressedMemory = compressMemory(combinedMemory);

    logInfo(`Updating memory for user ${user_id} in chatroom ${chatroom_id}`);
    await upsertMemory(user_id, chatroom_id, compressedMemory);

    return res.status(200).json({
      compressedMemory,
      message: "Memory compressed successfully.",
    });
  } catch (error) {
    logError(`Error in compress-memory: ${error.message}`);
    return res.status(500).json({ error: "Failed to compress memory. Please try again." });
  }
}
