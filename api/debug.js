// api/debug.js

import express from 'express';
import supabase, { supabaseRequest, setSessionContext } from '../lib/supabaseClient.js';
import { orchestrateContextWorkflow } from '../src/logic/workflow_manager.js';  // ✅ Import workflow manager for persistent IDs

const router = express.Router();

// ✅ Ensure user_id is passed during debug log creation
export async function logIssue({ userId, contextId, issue, resolution }) {
  try {
    // 🔒 Set session context for RLS enforcement
    await setSessionContext(userId, contextId);

    const { data, error } = await supabaseRequest(() =>
      supabase.from('debug_logs').insert([
        {
          user_id: userId,
          context_id: contextId,
          issue,
          resolution,
          created_at: new Date().toISOString() // Added timestamp
        }
      ])
    );

    if (error) {
      throw new Error(`Error logging issue: ${error.message}`);
    }

    return data[0];
  } catch (error) {
    console.error('Error in logIssue:', error);
    throw error;
  }
}

export async function fetchDebugLogs(contextId) {
  try {
    const { generatedIdentifiers } = await orchestrateContextWorkflow({});  // 🌐 Retrieve persistent IDs
    const persistentUserId = generatedIdentifiers.user_id;
    const persistentChatroomId = generatedIdentifiers.chatroom_id;

    // 🔒 Set session context for RLS enforcement
    await setSessionContext(persistentUserId, persistentChatroomId);

    const data = await supabaseRequest(() =>
      supabase
        .from('debug_logs')
        .select('*')
        .eq('context_id', contextId)
        .eq('user_id', persistentUserId)
        .eq('chatroom_id', persistentChatroomId)
    );

    return data;
  } catch (error) {
    console.error('Error in fetchDebugLogs:', error);
    throw error;
  }
}

router.post('/debug/log', async (req, res) => {
  try {
    const { query, issue, resolution } = req.body;

    // 🌐 Retrieve persistent IDs from the workflow manager
    const workflowContext = await orchestrateContextWorkflow({ query });
    const persistentUserId = workflowContext.generatedIdentifiers.user_id;
    const persistentChatroomId = workflowContext.generatedIdentifiers.chatroom_id;

    const log = await logIssue({
      userId: persistentUserId,
      contextId: persistentChatroomId,
      issue,
      resolution
    });

    res.status(200).json(log);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/debug/logs/:contextId', async (req, res) => {
  try {
    const { contextId } = req.params;
    const logs = await fetchDebugLogs(contextId);
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
