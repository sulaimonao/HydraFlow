// context-recap.js

import { fetchMemory } from "../lib/db.js";

export default async function handler(req, res) {
  try {
    if (req.method === "POST") {
      const { user_id, chatroom_id } = req.body;

      if (!user_id || !chatroom_id) {
        return res.status(400).json({ error: "user_id and chatroom_id are required." });
      }

      const memory = await fetchMemory({ userId: user_id, chatroomId: chatroom_id });

      const recap = `
        === Context Recap ===
        Memory:
        ${memory}
      `;

      return res.status(200).json({ recap: recap.trim() });
    } else {
      res.status(405).json({ error: "Method Not Allowed" });
    }
  } catch (error) {
    console.error("Error in context-recap:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}
