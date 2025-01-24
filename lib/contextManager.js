// lib/contextManager.js
import supabase, { supabaseRequest } from './supabaseClient';
import { orchestrateContextWorkflow } from '../src/logic/workflow_manager.js';
import { compressMemory } from '../src/utils/memoryCompression.js';
import { setSessionContext } from '../lib/sessionUtils.js';

/**
 * Sets the user and chatroom context for Supabase using persistent IDs from workflow_manager.
 * @param {string} query - The user query to derive session context.
 * @param {object} req - The request object for session tracking.
 * @returns {object} - Returns the user_id and chatroom_id if successful.
 */
export const setContext = async (query, req) => {
  console.log('🔍 Checking sessionContext middleware execution...');
  try {
    // Fetch persistent user_id and chatroom_id from workflow_manager and Supabase concurrently
    const [workflowContext, existingUserSession] = await Promise.all([
      orchestrateContextWorkflow(req, {
        query: req.body.query,
        memory: compressMemory(req.body.memory),
        feedback: req.body.feedback || null,
        tokenCount: req.body.tokenCount,
        existingMemory: req.body.existingMemory
      }),
      supabase.from('user_sessions').select('*').eq('user_id', req.user.id).single() // Check for existing session
    ]);

    const persistentUserId = workflowContext.generatedIdentifiers.user_id;
    const persistentChatroomId = workflowContext.generatedIdentifiers.chatroom_id;

    // Upsert the session context in Supabase for RLS enforcement using user_sessions table. Use upsert to handle potential race conditions.
    const { error } = await supabase.from('user_sessions').upsert({
      user_id: persistentUserId,
      chatroom_id: persistentChatroomId,
      created_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

    if (error) {
      throw new Error(`Failed to set/update session context: ${error.message}`);
    }

    console.log(`🔍 req.locals content: ${JSON.stringify(req.locals)}`);
    console.log(`🛠️ Session context set: user_id=${persistentUserId}, chatroom_id=${persistentChatroomId}`);

    return { user_id: persistentUserId, chatroom_id: persistentChatroomId };

  } catch (err) {
    console.error("⚠️ Error in setContext:", err.message);
    throw new Error("Failed to set context.");
  }
};
/**
 * Retrieves the current context from Supabase.
 * @param {object} req - The request object.
 * @returns {Promise<object>} - The current context.
 */
export const getContext = async (req) => {
  console.log('🔍 Checking sessionContext middleware execution...');
  try {
    // Validate req.user.id
    if (!req.user || !req.user.id) {
      console.error('❌ req.user.id is missing or undefined.');
      throw new Error('Session tracking requires a valid user ID.');
    }

    const { data, error } = await supabaseRequest(() =>
      supabase
        .from('context_state')
        .select('*')
        .eq('user_id', req.user.id)
        .single()
    );

    if (error) {
      console.error('❌ Error fetching context:', error);
      throw new Error('Failed to fetch context.');
    }

    console.log('✅ Context fetched successfully:', data);
    return data;
  } catch (err) {
    console.error('⚠️ Error in getContext:', err.message);
    throw new Error('Failed to get context.');
  }
};
