// api/compress-memory.js

import { compressMemory } from '../src/util/memoryUtils.js';
import { supabaseRequest } from '../lib/supabaseClient.js';
import { v4 as uuidv4 } from 'uuid';  // Import UUID generator for consistency

export default async function handler(req, res) {
  try {
    // Destructure necessary data from the request body
    const { user_id, chatroom_id, gaugeMetrics, memory } = req.body;

    /**
     * **UUID Generation for Missing IDs:**
     * If user_id or chatroom_id is missing, generate new UUIDs.
     * This ensures the process doesn't fail due to absent identifiers.
     */
    const generatedUserId = user_id || uuidv4();
    const generatedChatroomId = chatroom_id || uuidv4();

    /**
     * **Validation Check:**
     * Ensure all required fields are provided for memory compression.
     */
    if (!gaugeMetrics || !memory) {
      return res.status(400).json({
        error: 'gauge metrics and memory data are required for compression.'
      });
    }

    /**
     * **Ownership Verification:**
     * Check if the memory entry belongs to the correct user and chatroom.
     */
    const { data: existingMemory, error: memoryError } = await supabaseRequest(
      supabase
        .from('memories')
        .select('id')
        .eq('user_id', generatedUserId)
        .eq('chatroom_id', generatedChatroomId)
        .limit(1)
    );

    // Handle errors during the ownership verification
    if (memoryError) {
      console.error('Error validating memory ownership:', memoryError);
      return res.status(500).json({ error: 'Failed to validate memory ownership.' });
    }

    // If no matching memory is found, deny access
    if (!existingMemory || existingMemory.length === 0) {
      return res.status(403).json({ error: 'Unauthorized: Memory does not belong to the provided user or chatroom.' });
    }

    /**
     * **Memory Compression Execution:**
     * Compress the provided memory data using the provided gauge metrics.
     */
    const result = compressMemory(memory, gaugeMetrics);

    /**
     * **Audit Logging:**
     * Record the memory compression action in the debug_logs table for traceability.
     */
    await supabaseRequest(
      supabase.from('debug_logs').insert([
        {
          user_id: generatedUserId,
          context_id: existingMemory[0].id,
          issue: 'Memory compression executed',
          resolution: 'Memory successfully compressed',
          timestamp: new Date().toISOString()
        }
      ])
    );

    /**
     * **Successful Response:**
     * Return the result of the compression to the client.
     */
    res.status(200).json({
      message: 'Memory compression completed successfully.',
      data: result,
      user_id: generatedUserId,
      chatroom_id: generatedChatroomId
    });

  } catch (error) {
    /**
     * **Error Handling:**
     * Log and respond with detailed error information.
     */
    console.error("Error in compress-memory:", error);
    res.status(500).json({ error: error.message });
  }
}
