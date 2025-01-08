// api/autonomous.js

import { orchestrateContextWorkflow } from "../workflow_manager.js";

export default async (req, res) => {
  try {
    const { query, memory, logs, feedback, user_id, chatroom_id } = req.body;

    // Validate required input
    if (!query) {
      return res.status(400).json({ error: "Query is required." });
    }

    // Prepare additional context
    const context = {
      user_id: user_id || "default_user",
      chatroom_id: chatroom_id || "default_chatroom",
      timestamp: new Date().toISOString(),
    };

    // Delegate task orchestration to workflow_manager
    const result = await orchestrateContextWorkflow({ query, memory, logs, feedback, context });

    // Respond with the results of the workflow
    res.status(200).json({ message: "Workflow executed successfully", ...result });
  } catch (error) {
    console.error("Error in autonomous workflow:", error);
    res.status(500).json({ error: error.message || "Failed to execute workflow." });
  }
};
