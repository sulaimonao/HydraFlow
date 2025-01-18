// api/context-recap.js
import supabase, { supabaseRequest, setSessionContext } from '../lib/supabaseClient.js';
import { validateUserAndChatroom } from '../middleware/authMiddleware.js';
import { orchestrateContextWorkflow } from '../src/logic/workflow_manager.js';
import { updateMemory } from '../src/logic/memory_manager.js'; //Import memory update function

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { query, history, compressedMemory, additionalNotes } = req.body;

    // ✅ Validate required inputs
    if (!query || !compressedMemory || !history) {
      return res.status(400).json({ error: "Query, 'history', and 'compressedMemory' are required." });
    }

    if (additionalNotes && typeof additionalNotes !== 'string') {
      return res.status(400).json({ error: "'additionalNotes' must be a string if provided." });
    }

    // 🌐 Run workflow and update memory concurrently
    const [workflowContext, updateMemoryResult] = await Promise.all([
      orchestrateContextWorkflow(req, {
      query: query,
      history: history,
      compressedMemory: compressedMemory,
      additionalNotes: additionalNotes,
      tokenCount: req.body.tokenCount || 0, // Add tokenCount
      }),
      updateMemory(req.session.userId, req.session.chatroomId, compressedMemory) //Update memory concurrently
    ]);

    const persistentUserId = req.session.userId; // Use session ID
    const persistentChatroomId = req.session.chatroomId; //Use session ID

    // 🔍 Validate persistent IDs
    if (!persistentUserId || !persistentChatroomId) {
      console.error("❌ Missing persistent user_id or chatroom_id.");
      throw new Error("Failed to retrieve valid user_id and chatroom_id.");
    }

    // 🔒 Set session context for RLS enforcement with error handling
    try {
      await setSessionContext(persistentUserId, persistentChatroomId);
    } catch (error) {
      console.error("❌ Failed to set session context:", error.message);
      throw new Error("Failed to initialize session context.");
    }

    //Check for errors from the concurrent memory update
    if (updateMemoryResult.error) {
      console.error("❌ Failed to update memory in Supabase:", updateMemoryResult.error);
      // Consider a more nuanced error response, perhaps retry logic.
      throw new Error("Failed to update memory.");
    }


    // ✅ Validate User and Chatroom IDs
    if (!validateUserAndChatroom(persistentUserId, persistentChatroomId)) {
      return res.status(403).json({ error: "Invalid user_id or chatroom_id." });
    }

    // 📖 Construct the Context Recap
    const recap = `
      === Context Recap ===
      User ID: ${persistentUserId}
      Chatroom ID: ${persistentChatroomId}

      Compressed Memory:
      ${compressedMemory}

      Conversation History:
      ${history}

      ${additionalNotes ? `Additional Notes:\n${additionalNotes}\n` : ''}
    `;

    // 📊 Handle Gauge Metrics
    const gaugeMetrics = res.locals?.gaugeMetrics || {};
    if (!res.locals?.gaugeMetrics) {
      console.warn("⚠️ Warning: gaugeMetrics is missing. Using default values.");
    }

    // 📤 Respond with Recap and Gauge Metrics
    res.status(200).json({
      recap: recap.trim(),
      gaugeMetrics,
      user_id: persistentUserId,
      chatroom_id: persistentChatroomId
    });

  } catch (error) {
    console.error("❌ Error in context-recap:", error);
    res.status(error.status || 500).json({
      error: "Failed to generate context recap.",
      details: error.message || error
    });
  }
}
