// api/debug.js
import express from 'express';
import supabase, { supabaseRequest } from '../lib/supabaseClient.js';

const router = express.Router();  // Define a router

// Log an issue
export async function logIssue({ userId, contextId, issue, resolution }) {
  try {
    const data = await supabaseRequest(() => supabase.from('debug_logs').insert([{ user_id: userId, context_id: contextId, issue, resolution }])
    );

    return data[0];
  } catch (error) {
    console.error('Error in logIssue:', error);
    throw error;
  }
}

// Fetch debug logs
export async function fetchDebugLogs(contextId) {
  try {
    const data = await supabaseRequest(
      supabase.from('debug_logs').select('*').eq('context_id', contextId)
    );

    return data;
  } catch (error) {
    console.error('Error in fetchDebugLogs:', error);
    throw error;
  }
}

// Log an issue (API route)
router.post('/debug/log', async (req, res) => {
  try {
    const { userId, contextId, issue, resolution } = req.body;
    const log = await logIssue({ userId, contextId, issue, resolution });
    res.status(200).json(log);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch debug logs (API route)
router.get('/debug/logs/:contextId', async (req, res) => {
  try {
    const { contextId } = req.params;
    const logs = await fetchDebugLogs(contextId);
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;  // Export the router
