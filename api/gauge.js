// api/gauge.js
import { generateGaugeSnapshot } from "../src/logic/gauge_logic.js";
import { logInfo, logError } from "../src/util/logger.js";

export default async (req, res) => {
  try {
    const { userId, chatroomId } = req.body;

    if (!userId || !chatroomId) {
      logError("Invalid request: Missing userId or chatroomId.");
      return res.status(400).json({ error: "userId and chatroomId are required." });
    }

    logInfo(`Fetching gauge data for user ${userId} in chatroom ${chatroomId}.`);
    const gaugeData = await generateGaugeSnapshot(userId, chatroomId);

    return res.status(200).json({ gaugeData });
  } catch (error) {
    logError(`Error in gauge API: ${error.message}`);
    res.status(500).json({ error: "Failed to fetch gauge data." });
  }
};
