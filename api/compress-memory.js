// compress-memory.js

import { compressMemory } from '../utils/memoryUtils.js';
import { supabaseRequest } from '../lib/supabaseClient.js';

export default async function handler(req, res) {
  try {
    const { user_id, chatroom_id, gaugeMetrics, memory } = req.body;

    // Validate required data, including user and chatroom IDs
    if (!user_id || !chatroom_id || !gaugeMetrics || !memory) {
      return res.status(400).json({
        error: 'user_id, chatroom_id, gauge metrics, and memory data are required for compression.'
      });
    }

    // Optional: Verify that the user and chatroom IDs exist and are valid
    const { data: existingMemory, error: memoryError } = await supabaseRequest(
      supabase
        .from('memories')
        .select('id')
        .eq('user_id', user_id)
        .eq('chatroom_id', chatroom_id)
        .limit(1)
    );

    if (memoryError) {
      console.error('Error validating memory ownership:', memoryError);
      return res.status(500).json({ error: 'Failed to validate memory ownership.' });
    }

    if (existingMemory.length === 0) {
      return res.status(403).json({ error: 'Unauthorized: Memory does not belong to the provided user or chatroom.' });
    }

    // Proceed with memory compression
    const result = compressMemory(memory, gaugeMetrics);

    // Log compression activity to the debug_logs for auditing
    await supabaseRequest(
      supabase.from('debug_logs').insert([
        {
          user_id,
          context_id: existingMemory[0].id,
          issue: 'Memory compression executed',
          resolution: 'Memory successfully compressed',
          timestamp: new Date().toISOString()
        }
      ])
    );

    // Return the compression result
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in compress-memory:", error);
    res.status(500).json({ error: error.message });
  }
}
