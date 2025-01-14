// api/autonomous.js

import { orchestrateContextWorkflow } from '../src/logic/workflow_manager.js';
import supabase, { supabaseRequest, setSessionContext } from '../lib/supabaseClient.js';

export default async (req, res) => {
  try {
    const { query, memory, feedback } = req.body;

    // ✅ Validate required input for query
    if (!query) {
      return res.status(400).json({ error: "Query is required." });
    }

    // 🌐 Always retrieve persistent IDs from the workflow manager
    const workflowContext = await orchestrateContextWorkflow({ query, memory, feedback });
    const persistentUserId = workflowContext.generatedIdentifiers.user_id;
    const persistentChatroomId = workflowContext.generatedIdentifiers.chatroom_id;

    if (!persistentUserId || !persistentChatroomId) {
      return res.status(400).json({ error: "Persistent user_id and chatroom_id are required." });
    }

    // 🔒 Set the Supabase session context for RLS enforcement
    await setSessionContext(persistentUserId, persistentChatroomId);

    // Prepare additional context
    const context = {
      user_id: persistentUserId,
      chatroom_id: persistentChatroomId,
      timestamp: new Date().toISOString(),
    };

    // Log the start of the workflow
    console.log(`🚀 Starting workflow for user: ${context.user_id}, chatroom: ${context.chatroom_id}`);

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
        actionResult = await orchestrateContextWorkflow({
          query,
          memory,
          feedback,
          user_id: persistentUserId,
          chatroom_id: persistentChatroomId
        });
    }

    // Update context based on action result
    if (actionResult.updatedContext) {
      context.updatedContext = actionResult.updatedContext;
    }

    // Attach gauge metrics to the response
    const responsePayload = {
      message: "Workflow executed successfully",
      ...actionResult,
      gaugeMetrics: res.locals.gaugeMetrics || {},
    };

    // Log the successful completion of the workflow
    console.log(`✅ Workflow completed successfully for user: ${context.user_id}, chatroom: ${context.chatroom_id}`);

    // Respond with the results of the workflow
    res.status(200).json(responsePayload);

  } catch (error) {
    console.error("❌ Error in autonomous:", error);

    // Log the error with additional context
    console.error(`Error details: query: ${req.body.query}`);

    // Respond with a detailed error message
    res.status(500).json({ error: "Failed to execute workflow. Please try again.", details: error.message });
  }
};

// Function to handle context updates
async function updateContext(data, context) {
  try {
    // 🔄 Update context in the database
    const updateAction = supabase
      .from('context')
      .update({ ...data })
      .eq('user_id', context.user_id)
      .eq('chatroom_id', context.chatroom_id);

    const updatedData = await supabaseRequest(updateAction, context.user_id, context.chatroom_id);

    return { updatedContext: { ...context, ...updatedData } };
  } catch (error) {
    console.error("⚠️ Error updating context:", error.message);
    throw new Error("Failed to update context.");
  }
}

// Function to handle data fetching
async function fetchData(data, context) {
  try {
    // 📦 Fetch data related to user and chatroom
    const fetchAction = supabase
      .from('data')
      .select('*')
      .eq('user_id', context.user_id)
      .eq('chatroom_id', context.chatroom_id);

    const fetchedData = await supabaseRequest(fetchAction, context.user_id, context.chatroom_id);

    return { fetchedData };
  } catch (error) {
    console.error("⚠️ Error fetching data:", error.message);
    throw new Error("Failed to fetch data.");
  }
}
