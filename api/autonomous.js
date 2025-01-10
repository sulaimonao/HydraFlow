// api/autonomous.js

import { orchestrateContextWorkflow } from '../src/logic/workflow_manager.js';
import supabase, { supabaseRequest } from '../lib/supabaseClient.js';
import { v4 as uuidv4 } from 'uuid';

export default async (req, res) => {
  try {
    const { query, memory, feedback } = req.body;

    // Generate default user_id and chatroom_id if missing
    const user_id = req.body.user_id || uuidv4();
    const chatroom_id = req.body.chatroom_id || uuidv4();

    // Validate required input
    if (!query) {
      return res.status(400).json({ error: "Query is required." });
    }

    // Prepare additional context
    const context = {
      user_id,
      chatroom_id,
      timestamp: new Date().toISOString(),
    };

    // Log the start of the workflow
    console.log(`Starting workflow for user: ${context.user_id}, chatroom: ${context.chatroom_id}`);

    // Dynamic action handling based on query
    let actionResult;
    switch (query.action) {
      case 'updateContext':
        actionResult = await updateContext(query.data, context);
        break;
      case 'fetchData':
        actionResult = await fetchData(query.data, context);
        break;
      default:
        actionResult = await orchestrateContextWorkflow({ query, memory, feedback, user_id, chatroom_id });
    }

    // Update context based on action result
    if (actionResult.updatedContext) {
      context.updatedContext = actionResult.updatedContext;
    }

    // Attach gauge metrics to the response
    const responsePayload = {
      message: "Workflow executed successfully",
      ...actionResult,
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

// functions for dynamic action handling
async function updateContext(data, context) {
  // Implement context update logic here
  return { updatedContext: { ...context, ...data } };
}

async function fetchData(data, context) {
  // Implement data fetching logic here
  return { fetchedData: [] }; // Example response
}
