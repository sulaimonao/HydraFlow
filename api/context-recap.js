// api/context-recap.js 
import { fetchMemory, logInfo, logError } from "../src/util/context.js";

export default async (req, res) => {
  try {
    const { user_id, chatroom_id } = req.body;

    if (!user_id || !chatroom_id) {
      logError("Missing required fields: user_id or chatroom_id.");
      return res.status(400).json({ error: "user_id and chatroom_id are required." });
    }

    logInfo(`Fetching memory for user ${user_id} in chatroom ${chatroom_id}.`);
    const memory = await fetchMemory(user_id, chatroom_id);

    if (!memory) {
      logInfo(`No memory found for user ${user_id} in chatroom ${chatroom_id}.`);
      return res.status(404).json({ error: "No memory found for the specified user and chatroom." });
    }

    const recap = `### Context Recap:\nMemory:\n${memory}`;
    logInfo("Context recap generated successfully.");
    res.status(200).json({ recap: recap.trim() });
  } catch (error) {
    logError(`Error in context-recap: ${error.message}`);
    res.status(500).json({ error: "Internal server error." });
  }
};
