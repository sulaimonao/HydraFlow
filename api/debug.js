// api/debug.js
import express from 'express';
import supabase, { supabaseRequest } from '../lib/supabaseClient.js';

const router = express.Router();

// ✅ Ensure user_id is passed during debug log creation
export async function logIssue({ userId, contextId, issue, resolution }) {
  try {
      const { data, error } = await supabaseRequest(() =>
          supabase.from('debug_logs').insert([{
              user_id: userId,
              context_id: contextId,
              issue,
              resolution,
              created_at: new Date().toISOString() // Added timestamp
          }])
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
    const data = await supabaseRequest(() => supabase.from('debug_logs').select('*').eq('context_id', contextId));
    return data;
  } catch (error) {
    console.error('Error in fetchDebugLogs:', error);
    throw error;
  }
}

router.post('/debug/log', async (req, res) => {
  try {
    const { userId, contextId, issue, resolution } = req.body;
    const log = await logIssue({ userId, contextId, issue, resolution });
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
