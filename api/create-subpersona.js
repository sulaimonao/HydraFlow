// api/create-subpersona.js

import { addHead } from "../src/state/heads_state.js";

export default async (req, res) => {
  try {
    const { task, description, user_id, chatroom_id } = req.body;

    if (!task || !description || !user_id || !chatroom_id) {
      return res.status(400).json({
        error: "Task, description, user_id, and chatroom_id are required.",
      });
    }

    const newHead = await addHead(task, description, user_id, chatroom_id);

    return res.status(201).json({
      subPersonaName: newHead.name,
      description: newHead.taskDescription,
      status: newHead.status,
      createdAt: newHead.createdAt,
      message: "Sub-persona created successfully.",
    });
  } catch (error) {
    console.error("Error in create-subpersona:", error);
    return res.status(500).json({ error: "Failed to create sub-persona. Please try again." });
  }
};
