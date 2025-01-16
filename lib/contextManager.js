// lib/contextManager.js
import supabase, { supabaseRequest } from './supabaseClient';
import { orchestrateContextWorkflow } from '../src/logic/workflow_manager.js';
import {compressMemory} from '../src/utils/memoryCompression.js'

/**
 * Sets the user and chatroom context for Supabase using persistent IDs from workflow_manager.
 * @param {string} query - The user query to derive session context.
 * @param {object} req - The request object for session tracking.
 * @returns {object} - Returns the user_id and chatroom_id if successful.
 */
export const setContext = async (query, req) => {
  try {
    // ✅ Fetch persistent user_id and chatroom_id from workflow_manager
    const workflowContext = await orchestrateContextWorkflow(req, {
      query: req.body.query,
      memory: compressMemory(req.body.memory),
      feedback: req.body.feedback || null,
      tokenCount: req.body.tokenCount,
      existingMemory: req.body.existingMemory
    });
    const persistentUserId = workflowContext.generatedIdentifiers.user_id;
    const persistentChatroomId = workflowContext.generatedIdentifiers.chatroom_id;

    // 🚨 Validate the IDs before setting the context
    if (!persistentUserId || !persistentChatroomId) {
      throw new Error("Persistent user_id and chatroom_id are required to set context.");
    }

    // 🔐 Set the session context in Supabase for RLS enforcement using user_sessions table
    const userSessionContext = await supabaseRequest(() =>
      supabase.from('user_sessions').insert({
        user_id: persistentUserId,
        chatroom_id: persistentChatroomId,
        created_at: new Date().toISOString()
      })
    );

    if (userSessionContext.error) {
      throw new Error(`Failed to set session context: ${userSessionContext.error.message}`);
    }

    console.log(`🛠️ Session context set: user_id=${persistentUserId}, chatroom_id=${persistentChatroomId}`);

    return { user_id: persistentUserId, chatroom_id: persistentChatroomId };

  } catch (err) {
    console.error("⚠️ Failed to set context:", err.message);
    throw err;
  }
};
