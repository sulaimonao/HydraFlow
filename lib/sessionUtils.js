// lib/sessionUtils.js
import supabase from './supabaseClient.js';
import { withRetry } from './supabaseClient.js';

export const setSessionContext = async (user_id, chatroom_id) => {
  if (!user_id || !chatroom_id) {
    throw new Error("❌ user_id and chatroom_id must be provided and cannot be null.");
  }

  console.log(`🔐 Setting session context for user_id: ${user_id}, chatroom_id: ${chatroom_id}`);
  
  const { error } = await withRetry(() =>
    supabase.rpc('set_rls_context', { user_id, chatroom_id })
  );

  if (error) {
    console.error(`❌ Failed to set session context: ${error.message}`);
    throw new Error(`Failed to set session context: ${error.message}`);
  }

  console.log(`✅ Session context set for user_id: ${user_id}, chatroom_id: ${chatroom_id}`);
};
