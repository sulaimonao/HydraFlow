// context-recap.js
import { fetchMemory } from "../src/util/db_helpers.js";
import { logInfo, logError } from "../src/util/logger.js";

export async function compressMemoryHandler(req, res)
 {
  try {
    if (req.method !== "POST") {
      logError("Invalid HTTP method used for context-recap endpoint.");
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { user_id, chatroom_id } = req.body;

    if (!user_id || !chatroom_id) {
      logError("Missing required fields: user_id or chatroom_id.");
      return res.status(400).json({ error: "user_id and chatroom_id are required." });
    }

    logInfo(`Fetching memory for user ${user_id} in chatroom ${chatroom_id}`);
    const memory = await fetchMemory(user_id, chatroom_id);

    if (!memory) {
      logInfo(`No memory found for user ${user_id} in chatroom ${chatroom_id}`);
      return res.status(404).json({ error: "No memory found for the specified user and chatroom." });
    }

    const recap = `
      === Context Recap ===
      Memory:
      ${memory}
    `;

    logInfo("Context recap generated successfully.");
    return res.status(200).json({ recap: recap.trim() });
  } catch (error) {
    logError(`Error in context-recap: ${error.message}`);
    return res.status(500).json({ error: "Internal server error." });
  }
}
