// api/compress-memory.js
import { compressMemory, calculateTokenUsage } from '../src/util/memoryUtils.js';
import supabase, { supabaseRequest } from '../lib/supabaseClient.js';
import { sessionContext } from '../middleware/sessionContext.js';
import { setSessionContext } from '../lib/sessionUtils.js';
import winston from 'winston';

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
      if (attempt < retries) {
        const backoff = Math.pow(2, attempt) * 100;
        console.warn(`⚠️ Retry ${attempt} failed. Retrying in ${backoff}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoff));
      } else {
        logger.error(`❌ Task failed after ${attempt} attempts: ${error.message}`);
        throw error;
      }
    }
  }
}

export default async function handler(req, res) {
  sessionContext(req, res, async () => {
    try {
      const { userId, chatroomId } = req.session;
      await setSessionContext(userId, chatroomId);

      if (!req.session || !req.session.userId || !req.session.chatroomId) {
        console.error('❌ Error: req.session.userId or req.session.chatroomId is undefined.');
        return res.status(500).json({ error: 'Internal Server Error: Missing user or chatroom information.' });
      }

      const { query, memory, gaugeMetrics } = req.body;

      if (!memory || typeof memory !== "string") {
        return res.status(400).json({ error: 'Memory input must be a non-empty string.' });
      }

      const calculatedGaugeMetrics = gaugeMetrics ? gaugeMetrics : calculateTokenUsage(memory);

      if (calculatedGaugeMetrics.tokenCount < TOKEN_THRESHOLD) {
        return res.status(200).json({ message: 'Compression not required. Token load is acceptable.' });
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

      const compressedMemory = compressMemory(memory, calculatedGaugeMetrics);

      const updateResult = await withRetry(() =>
        supabaseRequest(
          supabase.from('memories')
            .update({ memory: compressedMemory })
            .eq('id', existingMemory[0].id)
        )
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
}
