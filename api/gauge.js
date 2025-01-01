// api/gauge.js
import { fetchGaugeData } from "../util/db_helpers.js";
import { STATUS } from "../src/util/constants.js";
import { logInfo, logError } from "../src/util/logger.js";

export default async function gaugeHandler(req, res) {
  try {
    if (req.method === "GET") {
      // Extract and validate query parameters
      const { user_id, chatroom_id } = req.query;
      if (!user_id || !chatroom_id) {
        logError("Missing required query parameters: user_id or chatroom_id.");
        return res.status(400).json({
          status: STATUS.ERROR,
          message: "Missing required query parameters: user_id and chatroom_id are mandatory.",
        });
      }

      const safeUserId = user_id;
      const safeChatroomId = chatroom_id;

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
