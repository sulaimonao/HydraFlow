// api/autonomous.js

import { orchestrateContextWorkflow } from '../src/logic/workflow_manager.js';
import supabase from '../lib/supabaseClient.js';

export default async (req, res) => {
  try {
    const { query, memory, feedback, user_id, chatroom_id } = req.body;

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
    const result = await orchestrateContextWorkflow({ query, memory, feedback, context });

    // Attach gauge metrics to the response
    const responsePayload = {
      message: "Workflow executed successfully",
      ...result,
      gaugeMetrics: res.locals.gaugeMetrics || {}, // Default to empty object
    };

    // Respond with the results of the workflow
    res.status(200).json(responsePayload);
  } catch (error) {
    console.error("Error in autonomous:", error);
    res.status(500).json({ error: "Failed to execute workflow. Please try again." });
  }
};
