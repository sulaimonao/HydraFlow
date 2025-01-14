// api/compress-memory.js

import { compressMemory, calculateTokenUsage } from '../src/util/memoryUtils.js';
import { supabaseRequest } from '../lib/supabaseClient.js';
import { v4 as uuidv4 } from 'uuid';

const TOKEN_THRESHOLD = 3000;  // 🔥 Adjust as needed

export default async function handler(req, res) {
  try {
    const { user_id, chatroom_id, gaugeMetrics, memory } = req.body;

    // 🔒 Persistent session handling
    const generatedUserId = user_id || uuidv4();
    const generatedChatroomId = chatroom_id || uuidv4();

    // ⚠️ Validate memory
    if (!memory) {
      return res.status(400).json({ error: 'Memory data is required for compression.' });
    }

    // 🔍 Calculate gauge metrics if missing
    const calculatedGaugeMetrics = gaugeMetrics || calculateTokenUsage(memory);

    // 🚀 Auto-trigger compression if token load is too high
    if (calculatedGaugeMetrics.tokenCount < TOKEN_THRESHOLD) {
      return res.status(200).json({ message: 'Compression not required. Token load is acceptable.' });
    }

    // 🔐 Verify ownership of memory
    const { data: existingMemory, error: memoryError } = await supabaseRequest(
      supabase
        .from('memories')
        .select('id, content')
        .eq('user_id', generatedUserId)
        .eq('chatroom_id', generatedChatroomId)
        .limit(1)
    );

    if (memoryError) {
      console.error('Error validating memory ownership:', memoryError);
      return res.status(500).json({ error: 'Failed to validate memory ownership.' });
    }

    if (!existingMemory || existingMemory.length === 0) {
      return res.status(403).json({ error: 'Unauthorized: Memory does not belong to the provided user or chatroom.' });
    }

    // 🧠 Execute memory compression
    const compressedMemory = compressMemory(memory, calculatedGaugeMetrics);

    // 📦 Update the compressed memory in the database
    await supabaseRequest(
      supabase
        .from('memories')
        .update({ content: compressedMemory })
        .eq('id', existingMemory[0].id)
    );

    // 📝 Log compression in debug_logs
    await supabaseRequest(
      supabase.from('debug_logs').insert([
        {
          user_id: generatedUserId,
          context_id: existingMemory[0].id,
          issue: 'Memory compression executed',
          resolution: 'Memory compressed and updated in DB',
          timestamp: new Date().toISOString()
        }
      ])
    );

    // ✅ Return success response
    res.status(200).json({
      message: 'Memory compression completed and updated successfully.',
      data: compressedMemory,
      user_id: generatedUserId,
      chatroom_id: generatedChatroomId
    });

  } catch (error) {
    console.error("Error in compress-memory:", error);
    res.status(500).json({ error: error.message });
  }
}
