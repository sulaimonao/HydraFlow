// api/gauge.js
import { fetchGaugeData, STATUS, logInfo, logError } from "../src/util/gauge.js";

export default async function gaugeHandler(req, res) {
  try {
    if (req.method === "GET") {
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

      const gaugeData = await fetchGaugeData({ userId: safeUserId, chatroomId: safeChatroomId });

      if (!gaugeData) {
        logInfo(`No gauge data found for user ${safeUserId} in chatroom ${safeChatroomId}.`);
        return res.status(404).json({
          status: STATUS.ERROR,
          message: "Gauge data not found for the provided identifiers.",
        });
      }

      return res.status(200).json({
        status: STATUS.SUCCESS,
        user_id: safeUserId,
        chatroom_id: safeChatroomId,
        ...gaugeData,
      });
    } else {
      res.setHeader("Allow", ["GET"]);
      logError(`Unsupported method ${req.method} on gauge route.`);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    logError(`Error in gauge route: ${error.message}`);
    return res.status(500).json({
      status: STATUS.ERROR,
      error: "Internal server error.",
    });
  }
}