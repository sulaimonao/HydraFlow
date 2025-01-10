// api/autonomous.js

import { orchestrateContextWorkflow } from '../src/logic/workflow_manager.js';
import supabase, { supabaseRequest } from '../lib/supabaseClient.js';

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

    // Log the start of the workflow
    console.log(`Starting workflow for user: ${context.user_id}, chatroom: ${context.chatroom_id}`);

    // Delegate task orchestration to workflow_manager
    const result = await orchestrateContextWorkflow({ query, memory, feedback, context });

    // Attach gauge metrics to the response
    const responsePayload = {
      message: "Workflow executed successfully",
      ...result,
      gaugeMetrics: res.locals.gaugeMetrics || {}, // Default to empty object
    };

    // Log the successful completion of the workflow
    console.log(`Workflow completed successfully for user: ${context.user_id}, chatroom: ${context.chatroom_id}`);

    // Respond with the results of the workflow
    res.status(200).json(responsePayload);
  } catch (error) {
    console.error("Error in autonomous:", error);

    // Log the error with additional context
    console.error(`Error details: user: ${req.body.user_id}, chatroom: ${req.body.chatroom_id}, query: ${req.body.query}`);

    // Respond with a detailed error message
    res.status(500).json({ error: "Failed to execute workflow. Please try again.", details: error.message });
  }
};
