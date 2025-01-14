import { orchestrateContextWorkflow } from '../src/logic/workflow_manager.js';
import supabase, { supabaseRequest, setSessionContext } from '../lib/supabaseClient.js';
import { v4 as uuidv4 } from 'uuid';

export default async (req, res) => {
  try {
    const { query, memory, feedback, user_id, chatroom_id } = req.body;

    // Validate that user_id and chatroom_id are provided
    if (!user_id || !chatroom_id) {
      return res.status(400).json({ error: "Missing user_id or chatroom_id. Both are required." });
    }

    // Validate required input for query
    if (!query) {
      return res.status(400).json({ error: "Query is required." });
    }

    // 🛠️ Set the Supabase session context for RLS enforcement
    await setSessionContext(user_id, chatroom_id);

    // Prepare additional context
    const context = {
      user_id,
      chatroom_id,
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
      gaugeMetrics: res.locals.gaugeMetrics || {}, // Default to empty object if metrics are missing
    };

    // Log the successful completion of the workflow
    console.log(`✅ Workflow completed successfully for user: ${context.user_id}, chatroom: ${context.chatroom_id}`);

    // Respond with the results of the workflow
    res.status(200).json(responsePayload);
  } catch (error) {
    console.error("❌ Error in autonomous:", error);

    // Log the error with additional context
    console.error(`Error details: user: ${req.body.user_id}, chatroom: ${req.body.chatroom_id}, query: ${req.body.query}`);

    // Respond with a detailed error message
    res.status(500).json({ error: "Failed to execute workflow. Please try again.", details: error.message });
  }
};

// Function to handle context updates
async function updateContext(data, context) {
  try {
    // 🔄 Update context in the database (example implementation)
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
    // 📦 Fetch data related to user and chatroom (example implementation)
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
