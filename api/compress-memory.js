// api/compress-memory.js
import { compressMemory, calculateTokenUsage } from '../src/util/memoryUtils.js';
import supabase, { supabaseRequest, setSessionContext } from '../lib/supabaseClient.js';
import { orchestrateContextWorkflow } from '../src/logic/workflow_manager.js';

const TOKEN_THRESHOLD = 3000;

export default async function handler(req, res) {
  try {
    const { query, memory, gaugeMetrics } = req.body;

    // 🌐 Retrieve persistent user and chatroom IDs
    const workflowContext = await orchestrateContextWorkflow({ query, memory, req });
    const persistentUserId = workflowContext.generatedIdentifiers.user_id;
    const persistentChatroomId = workflowContext.generatedIdentifiers.chatroom_id;

    // ⚠️ Validate memory input
    if (!memory) {
      return res.status(400).json({ error: 'Memory data is required for compression.' });
    }

    // 🔒 Set session context for RLS enforcement
    await setSessionContext(persistentUserId, persistentChatroomId);

    // 🔍 Calculate gauge metrics if not provided
    const calculatedGaugeMetrics = gaugeMetrics || calculateTokenUsage(memory);

    // 🚀 Skip compression if below the token threshold
    if (calculatedGaugeMetrics.tokenCount < TOKEN_THRESHOLD) {
      return res.status(200).json({ message: 'Compression not required. Token load is acceptable.' });
    }

    // 🔐 Verify memory ownership
    const { data: existingMemory, error: memoryError } = await supabaseRequest(
      supabase
        .from('memories')
        .select('id, memory')  // ✅ Fixed: Changed 'content' to 'memory'
        .eq('user_id', persistentUserId)
        .eq('chatroom_id', persistentChatroomId)
        .limit(1)
    );

    if (memoryError) {
      console.error('Error validating memory ownership:', memoryError);
      return res.status(500).json({ error: 'Failed to validate memory ownership.' });
    }

    if (!existingMemory || existingMemory.length === 0) {
      return res.status(403).json({ error: 'Unauthorized: Memory does not belong to the provided user or chatroom.' });
    }

    // 🧠 Compress memory efficiently
    const compressedMemory = compressMemory(memory, calculatedGaugeMetrics);

    // 📦 Update the compressed memory in the database
    await supabaseRequest(
      supabase
        .from('memories')
        .update({ memory: compressedMemory })  // ✅ Fixed: Changed 'content' to 'memory'
        .eq('id', existingMemory[0].id)
    );

    // 📝 Log the compression process in debug_logs
    await supabaseRequest(
      supabase.from('debug_logs').insert([
        {
          user_id: persistentUserId,
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
      user_id: persistentUserId,
      chatroom_id: persistentChatroomId
    });

  } catch (error) {
    console.error("Error in compress-memory:", error);
    res.status(500).json({ error: error.message });
  }
}
