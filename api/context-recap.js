// api/context-recap.js

import supabase, { supabaseRequest, setSessionContext } from '../lib/supabaseClient.js';
import { validateUserAndChatroom } from '../middleware/authMiddleware.js';
import { orchestrateContextWorkflow } from '../src/logic/workflow_manager.js';  // ✅ Import workflow manager for persistent IDs

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { query, history, compressedMemory, additionalNotes } = req.body;

    // 🌐 Retrieve persistent IDs from the workflow manager
    const workflowContext = await orchestrateContextWorkflow({ query, req });
    const persistentUserId = workflowContext.generatedIdentifiers.user_id;
    const persistentChatroomId = workflowContext.generatedIdentifiers.chatroom_id;

    // 🔒 Set session context for RLS enforcement
    await setSessionContext(persistentUserId, persistentChatroomId);

    // ✅ Validate User and Chatroom IDs
    if (!validateUserAndChatroom(persistentUserId, persistentChatroomId)) {
      return res.status(403).json({ error: "Invalid user_id or chatroom_id." });
    }

    // ✅ Validate required inputs
    if (!compressedMemory || !history) {
      return res.status(400).json({ error: "Both 'history' and 'compressedMemory' are required." });
    }

    if (additionalNotes && typeof additionalNotes !== 'string') {
      return res.status(400).json({ error: "'additionalNotes' must be a string if provided." });
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
      console.warn("Warning: gaugeMetrics is missing. Using default values.");
    }

    // 📤 Respond with Recap and Gauge Metrics
    res.status(200).json({
      recap: recap.trim(),
      gaugeMetrics,
      user_id: persistentUserId,
      chatroom_id: persistentChatroomId
    });

  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
