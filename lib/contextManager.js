// lib/contextManager.js

import supabase, { supabaseRequest } from './supabaseClient';
import { orchestrateContextWorkflow } from '../src/logic/workflow_manager.js';

/**
 * Sets the user and chatroom context for Supabase using persistent IDs from workflow_manager.
 * @param {string} query - The user query to derive session context.
 */
export const setContext = async (query) => {
  try {
    // ✅ Fetch persistent user_id and chatroom_id from workflow_manager
    const workflowContext = await orchestrateContextWorkflow({ query });
    const persistentUserId = workflowContext.generatedIdentifiers.user_id;
    const persistentChatroomId = workflowContext.generatedIdentifiers.chatroom_id;

    // 🚨 Validate the IDs before setting the context
    if (!persistentUserId || !persistentChatroomId) {
      throw new Error("Persistent user_id and chatroom_id are required to set context.");
    }

    // 🔐 Set the session context in Supabase for RLS enforcement
    await supabaseRequest(() => 
      supabase.rpc('set_config', { key: 'app.user_id', value: persistentUserId })
    );
    await supabaseRequest(() => 
      supabase.rpc('set_config', { key: 'app.chatroom_id', value: persistentChatroomId })
    );

    console.log(`🛠️ Context set: user_id=${persistentUserId}, chatroom_id=${persistentChatroomId}`);
    
    return { user_id: persistentUserId, chatroom_id: persistentChatroomId };
    
  } catch (err) {
    console.error("⚠️ Failed to set context:", err.message);
    throw err;
  }
};
