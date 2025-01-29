// api/compress-memory.js
import express from 'express';
import { compressMemory, calculateTokenUsage } from '../src/util/memoryUtils.js';
import { supabase, supabaseRequest } from '../lib/db.js';
import { setSessionContext } from '../lib/sessionUtils.js';
import winston from 'winston';

const router = express.Router();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

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

router.post('/', sessionContext, async (req, res) => {
  try {
    if (!req.session || !req.session.userId || !req.session.chatroomId) {
      return res.status(400).json({ error: 'User ID and Chatroom ID are required.' });
    }

    const { userId, chatroomId } = req.session;
    await setSessionContext(userId, chatroomId);

    const { query, memory, feedback, tokenCount } = req.body;

    // ✅ Validate input
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: "Invalid or missing 'query' parameter." });
    }

    // 🔍 Retrieve metric type
    const metricType = req.query.metricType || 'default';
    console.log(`📊 Fetching gauge metrics for type: ${metricType}`);

    let { tokenUsage, responseLatency, activeSubpersonas } = req.body;

    // 🔄 Retrieve token usage if not provided
    if (!tokenUsage) {
      tokenUsage = await calculateMetrics(query, memory, feedback, tokenCount);
    }

    if (!memory || typeof memory !== "string") {
      return res.status(400).json({ error: 'Memory input must be a non-empty string.' });
    }

    const calculatedGaugeMetrics = gaugeMetrics ? gaugeMetrics : calculateTokenUsage(memory);

    if (calculatedGaugeMetrics.tokenCount < TOKEN_THRESHOLD) {
      return res.status(200).json({
        message: "Memory usage is within acceptable limits.",
        tokenUsage: calculatedGaugeMetrics.tokenCount,
      });
    }

    const { data: existingMemory, error: memoryError } = await withRetry(() =>
      supabaseRequest(
        supabase
          .from('memories')
          .select('*')
          .eq('user_id', userId)
          .eq('chatroom_id', chatroomId)
          .limit(1)
      )
    );

    if (memoryError) {
      console.error('❌ Error validating memory ownership:', memoryError);
      return res.status(500).json({ error: 'Failed to validate memory ownership', details: memoryError });
    }

    if (!existingMemory || existingMemory.length === 0) {
      console.warn(`⚠️ No memory found for user: ${userId}, chatroom: ${chatroomId}`);
      return res.status(404).json({ error: 'No memory found for the provided user and chatroom.' });
    }

    const compressedMemory = compressMemory(memory);

    const updateResult = await withRetry(() =>
      supabase.from('memories')
        .update({ memory: compressedMemory })
        .eq('id', existingMemory[0].id)
    );

    if (updateResult.error) {
      console.error('❌ Failed to update compressed memory:', updateResult.error);
      return res.status(500).json({ error: 'Failed to update memory in the database.' });
    }

    await supabaseRequest(
      supabase.from('debug_logs').insert([
        {
          user_id: userId,
          chatroom_id: chatroomId,
          issue: 'Memory compression executed',
          resolution: 'Memory compressed and updated in DB',
          timestamp: new Date().toISOString()
        }
      ])
    );

    res.status(200).json({
      success: true,
      message: 'Memory compression completed and updated successfully.',
      compressedMemory,
      user_id: userId,
      chatroom_id: chatroomId
    });
  } catch (error) {
    logger.error("❌ Error in compress-memory handler:", error);
    res.status(500).json({ error: "Failed to compress memory.", details: error.message });
  }
});

export default router;
