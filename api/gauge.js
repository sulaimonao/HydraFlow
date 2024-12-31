// api/gauge.js
import { fetchGaugeData } from "../lib/db.js";
import { STATUS } from "../src/util/constants.js";
import { logInfo, logError } from "../src/util/logger.js";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      // Extract and validate query parameters
      const { user_id, chatroom_id } = req.query;
      const safeUserId = user_id || "defaultUser";
      const safeChatroomId = chatroom_id || "defaultChatroom";

      logInfo(`Fetching gauge data for user ${safeUserId} in chatroom ${safeChatroomId}.`);

      // Fetch gauge data from the database
      const gaugeData = await fetchGaugeData({ userId: safeUserId, chatroomId: safeChatroomId });

      // Handle the case where no gauge data is found
      if (!gaugeData) {
        logInfo(`No gauge data found for user ${safeUserId} in chatroom ${safeChatroomId}.`);
        return res.status(404).json({
          status: STATUS.ERROR,
          message: "Gauge data not found for the provided identifiers.",
        });
      }

      // Log successful retrieval
      logInfo(`Gauge data retrieved successfully for user ${safeUserId} in chatroom ${safeChatroomId}.`, gaugeData);

      // Respond with gauge data
      return res.status(200).json({
        status: STATUS.SUCCESS,
        user_id: safeUserId,
        chatroom_id: safeChatroomId,
        ...gaugeData,
      });
    } else {
      // Handle unsupported HTTP methods
      res.setHeader("Allow", ["GET"]);
      logError(`Unsupported method ${req.method} on gauge route.`);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    // Handle unexpected errors
    logError(`Error in gauge route: ${error.message}`);
    return res.status(500).json({
      status: STATUS.ERROR,
      error: "Internal server error.",
    });
  }
}
