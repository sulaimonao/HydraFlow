// api/compress-memory.js
import { compressMemory } from "../src/actions/memory_compressor.js";
import { appendMemory } from "../lib/db.js";

export default async (req, res) => {
  try {
    const { memory, user_id, chatroom_id } = req.body;

    if (!memory || typeof memory !== "string" || !user_id || !chatroom_id) {
      return res.status(400).json({
        error: "A valid memory string, user_id, and chatroom_id are required.",
      });
    }

    const compressedMemory = compressMemory(memory).compressedMemory;
    await appendMemory({ userId: user_id, chatroomId: chatroom_id, memoryChunk: compressedMemory });

    return res.status(200).json({ compressedMemory, message: "Memory compressed successfully." });
  } catch (error) {
    console.error("Error in compress-memory:", error);
    return res.status(500).json({ error: "Failed to compress memory. Please try again." });
  }
};
