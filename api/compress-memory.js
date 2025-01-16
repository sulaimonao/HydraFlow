// api/compress-memory.js
import { compressMemory, calculateTokenUsage } from '../src/util/memoryUtils.js';
import supabase, { supabaseRequest, setSessionContext } from '../lib/supabaseClient.js';
import { orchestrateContextWorkflow } from '../src/logic/workflow_manager.js';

const TOKEN_THRESHOLD = 3000;

async function withRetry(task, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await task();
    } catch (error) {
      console.warn(`⚠️ Attempt ${attempt} failed: ${error.message}`);
      if (attempt === retries) throw error;
    }
  }
}

export default async function handler(req, res) {
  try {
    const { query, memory, gaugeMetrics, user_id, chatroom_id } = req.body;

    // ✅ Validate input memory
    if (!memory || typeof memory !== "string") {
      return res.status(400).json({ error: 'Memory data is required and must be a string.' });
    }

    // Verify Supabase connection
    if (!supabase) {
      console.error("❌ Supabase connection not established.");
      return res.status(500).json({ error: 'Database connection failed.' });
    }

    // Validate user_id and chatroom_id if provided directly
    if (user_id && chatroom_id) {
      await setSessionContext(user_id, chatroom_id);
    }

    // 🌐 Initialize session context via workflow manager
    const workflowContext = await orchestrateContextWorkflow(req, {
      query: query || '',
      memory: memory || '',
      feedback: null,
      tokenCount: gaugeMetrics?.tokenCount || 0,
    });

    const persistentUserId = workflowContext.generatedIdentifiers?.user_id;
    const persistentChatroomId = workflowContext.generatedIdentifiers?.chatroom_id;

    // 🔒 Validate persistent session IDs
    if (!persistentUserId || !persistentChatroomId) {
      console.error("❌ Missing session identifiers.");
      return res.status(400).json({ error: 'Persistent user_id and chatroom_id are required.' });
    }

    // 🧮 Calculate gauge metrics if not provided
    const calculatedGaugeMetrics = gaugeMetrics ? gaugeMetrics : calculateTokenUsage(memory);
    // 🚀 Skip compression if below token threshold
    if (calculatedGaugeMetrics.tokenCount < TOKEN_THRESHOLD) {
      return res.status(200).json({ message: 'Compression not required. Token load is acceptable.' });
    }

    // 🔐 Validate memory ownership with retry
    const { data: existingMemory, error: memoryError } = await withRetry(() =>
      supabaseRequest(
        supabase
          .from('memories')
          .select('id, memory')
          .eq('user_id', persistentUserId)
          .eq('chatroom_id', persistentChatroomId)
          .limit(1)
      )
    );

    if (memoryError) {
      console.error('❌ Error validating memory ownership:', memoryError);
      return res.status(500).json({ error: 'Failed to validate memory ownership.' });
    }

    if (!existingMemory || existingMemory.length === 0) {
      console.warn(`⚠️ No memory found for user: ${persistentUserId}, chatroom: ${persistentChatroomId}`);
      return res.status(403).json({ error: 'Unauthorized: Memory does not belong to the provided user or chatroom.' });
    }

    // 🗜️ Compress memory efficiently
    const compressedMemory = compressMemory(memory, calculatedGaugeMetrics);

    // 📦 Update compressed memory in Supabase with retry
    const updateResult = await withRetry(() =>
      supabaseRequest(
        supabase.from('memories')
          .update({ memory: compressedMemory })
          .eq('id', existingMemory[0].id),
        persistentUserId,
        persistentChatroomId
      )
    );

    if (updateResult.error) {
      console.error('❌ Failed to update compressed memory:', updateResult.error);
      return res.status(500).json({ error: 'Failed to update memory in the database.' });
    }

    // 📝 Log compression in debug_logs
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

    // ✅ Return successful response
    res.status(200).json({
      success: true,
      message: 'Memory compression completed and updated successfully.',
      data: compressedMemory,
      user_id: persistentUserId,
      chatroom_id: persistentChatroomId
    });
  } catch (error) {
    console.error("❌ Error in compress-memory:", error);
    res.status(500).json({
      success: false,
      error: 'Failed to compress memory.',
      details: error.message
    });
  }
}
