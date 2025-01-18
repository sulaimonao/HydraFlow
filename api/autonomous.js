// api/autonomous.js
import { createSubpersona } from './create-subpersona.js';
import { orchestrateContextWorkflow } from '../src/logic/workflow_manager.js';
import supabase, { supabaseRequest, setSessionContext } from '../lib/supabaseClient.js';

export default async (req, res) => {  
  try {
    const { query, memory, feedback } = req.body;

    // ✅ Validate required input for query
    if (!query || typeof query !== "object") {
      return res.status(400).json({ error: "Invalid or missing query object." });
    }

    // 🌐 Initialize workflow and retrieve session IDs
    const workflowContextPromise = orchestrateContextWorkflow(req, {
      query: query || '',
      memory: memory || '',
      feedback: feedback || null,
      tokenCount: req.body.tokenCount || 0,
    });
    const { user_id: persistentUserId, chatroom_id: persistentChatroomId } = workflowContext.generatedIdentifiers || {};

    if (!persistentUserId || !persistentChatroomId) {
      return res.status(400).json({ error: "Persistent user_id and chatroom_id are required." });
    }

    // 🔒 Set Supabase session context for RLS
    const setContextPromise = setSessionContext(req.session.userId, req.session.chatroomId);

    // 🌐 Prepare session context
    const context = {
      user_id: persistentUserId,
      chatroom_id: persistentChatroomId,
      timestamp: new Date().toISOString(),
    };

    console.log(`🚀 Starting workflow for user: ${context.user_id}, chatroom: ${context.chatroom_id}`);

    const workflowContext = await workflowContextPromise;
    await setContextPromise;

    // ✅ Dynamic action handling
    let actionResult;
    if (query.action && typeof query.action === "string") {
      switch (query.action) {
        case 'updateContext':
          actionResult = await updateContext(query.data, context); 
          break;
        case 'fetchData':
          actionResult = await fetchData(query.data, context); 
          break;
        default:
          return res.status(400).json({ error: `Invalid action: ${query.action}` });
      }
    } else {
      actionResult = workflowContext; // Reuse initial workflow result
    }

    // ✅ Update context if applicable
    if (actionResult.updatedContext) {
      context.updatedContext = actionResult.updatedContext;
    }

    // ✅ Attach gauge metrics to response
    const responsePayload = {
      message: "Workflow executed successfully",
      ...actionResult,
      gaugeMetrics: res.locals.gaugeMetrics || {},
    };

    console.log(`✅ Workflow completed for user: ${context.user_id}, chatroom: ${context.chatroom_id}`);

    // ✅ Send successful response
    res.status(200).json(responsePayload);

  } catch (error) {
    console.error("❌ Error in autonomous workflow:", error);
    console.error(`Error details: query=${JSON.stringify(req.body.query)}, user_id=${req.session.userId}, chatroom_id=${req.session.chatroomId}`);

    res.status(500).json({
      error: "Failed to execute workflow. Please try again.",
      details: error.message,
    });
  }
};

// ✅ Handles context updates
async function updateContext(data, context) {
  try {
    const { data: updatedData } = await supabaseRequest(supabase
      .from('chatrooms')
      .update({ ...data })
      .eq('user_id', context.user_id)
      .eq('chatroom_id', context.chatroom_id), context.user_id, context.chatroom_id);
    
    return { updatedContext: { ...context, ...updatedData[0] } }; // Assuming single row update
  } catch (error) {
    console.error("⚠️ Error updating context:", error.message);
    throw new Error("Failed to update context.");
  }
}

// ✅ Handles data fetching
async function fetchData(data, context) {
  try {
    const { data: fetchedData } = await supabaseRequest(supabase
      .from('chatrooms')
      .select('*')
      .eq('user_id', context.user_id)
      .eq('chatroom_id', context.chatroom_id), context.user_id, context.chatroom_id);
    
    return { data: fetchedData[0] }; // Assuming single row fetch
  } catch (error) {
    console.error("⚠️ Error fetching data:", error.message);
    throw new Error("Failed to fetch data.");
  }
}
