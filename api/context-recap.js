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

    // 🌐 Retrieve persistent IDs from the workflow manager
    const workflowContext = await orchestrateContextWorkflow(req, {
      query: query,
      history: history,
      compressedMemory: compressedMemory,
      additionalNotes: additionalNotes,
      tokenCount: req.body.tokenCount || 0, // Add tokenCount
    });
    const persistentUserId = workflowContext?.generatedIdentifiers?.user_id;
    const persistentChatroomId = workflowContext?.generatedIdentifiers?.chatroom_id;

    // 🔍 Validate persistent IDs
    if (!persistentUserId || !persistentChatroomId) {
      console.error("❌ Missing persistent user_id or chatroom_id.");
      return res.status(400).json({ error: "Failed to retrieve valid user_id and chatroom_id." });
    }

    // 🔒 Set session context for RLS enforcement with error handling
    try {
      await setSessionContext(persistentUserId, persistentChatroomId);
    } catch (error) {
      console.error("❌ Failed to set session context:", error);
      return res.status(500).json({ error: "Failed to initialize session context." });
    }

    // 💾 Update Supabase with compressed memory.  Error handling included.
    try {
      await updateMemory(persistentUserId, persistentChatroomId, compressedMemory);
    } catch (updateError) {
      console.error("❌ Failed to update memory in Supabase:", updateError);
      // Consider a more nuanced error response, perhaps retry logic.
      return res.status(500).json({ error: "Failed to update memory." });
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
    res.status(500).json({
      error: "Failed to generate context recap.",
      details: error.message
    });
  }
}
