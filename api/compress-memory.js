// api/compress-memory.js (Local SQLite Version)
import express from 'express';
import { compressMemory, calculateTokenUsage } from '../src/util/memoryUtils.js';
// Removed supabaseRequest import
//import { supabase, supabaseRequest } from '../lib/db.js';
import * as db from '../lib/db.js'; // Import SQLite db module
// Remove setSessionContext import as it is no longer used
//import { setSessionContext } from '../lib/sessionUtils.js';
import winston from 'winston';
import { sessionContext } from '../middleware/sessionContext.js';

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

// Keep the withRetry function (it's generic and useful)
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
        // Remove setSessionContext as it's not needed anymore
        // await setSessionContext(userId, chatroomId);

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

        const calculatedGaugeMetrics = calculateTokenUsage(memory); // Directly calculate


        if (calculatedGaugeMetrics.tokenCount < TOKEN_THRESHOLD) {
            return res.status(200).json({
                message: "Memory usage is within acceptable limits.",
                tokenUsage: calculatedGaugeMetrics.tokenCount,
            });
        }

        // Fetch existing memory
        const existingMemory = await db.fetchMemory(userId, chatroomId);


        if (!existingMemory) {
            console.warn(`⚠️ No memory found for user: ${userId}, chatroom: ${chatroomId}`);
            return res.status(404).json({ error: 'No memory found for the provided user and chatroom.' });
        }
        const compressedMemory = compressMemory(memory);

        // Update the memory
       const updateResult = await db.updateMemory(userId, chatroomId, compressedMemory);

        if(!updateResult){
             console.error('❌ Failed to update compressed memory:');
            return res.status(500).json({ error: 'Failed to update memory in the database.' });
        }

        // Log the memory compression
        await db.logIssue(userId, chatroomId, 'Memory compression executed', 'Memory compressed and updated in DB');


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
// --- Added Functions to db.js ---
async function fetchMemory(userId, chatroomId) {
    const sql = `SELECT * FROM memories WHERE user_id = ? AND chatroom_id = ? ORDER BY created_at DESC LIMIT 1`;
    const memory = await db.get(sql, [userId, chatroomId]); // Using promisifyDbGet
    return memory;
}

async function updateMemory(userId, chatroomId, compressedMemory) {
    // Check if a memory entry already exists
    const existingMemory = await fetchMemory(userId, chatroomId);

    if (existingMemory) {
        // Update existing memory
        const sql = `UPDATE memories SET memory = ? WHERE user_id = ? AND chatroom_id = ?`;
        await db.run(sql, [compressedMemory, userId, chatroomId]); // Using promisifyDbRun
    } else {
        // Insert new memory
        const sql = `INSERT INTO memories (user_id, chatroom_id, memory) VALUES (?, ?, ?)`;
        await db.run(sql, [userId, chatroomId, compressedMemory]); // Using promisifyDbRun
    }
    return true;
}

export default router;