// api/gauge.js

import { fetchGaugeData } from "../lib/db.js";
import { STATUS } from "../src/util/constants.js";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const { user_id, chatroom_id } = req.query;
      const safeUserId = user_id || "defaultUser";
      const safeChatroomId = chatroom_id || "defaultChatroom";

      const gaugeData = await fetchGaugeData({ userId: safeUserId, chatroomId: safeChatroomId });

      return res.status(200).json({
        status: STATUS.SUCCESS,
        user_id: safeUserId,
        chatroom_id: safeChatroomId,
        ...gaugeData,
      });
    } catch (error) {
      console.error("Error in gauge route:", error);
      return res.status(500).json({ status: STATUS.ERROR, error: "Internal server error." });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
