// src/actions/memory_compressor.js (Local SQLite Version)
// Removed Supabase imports
//import { supabase, supabaseRequest } from '../../lib/db.js';
import * as db from '../../lib/db.js'; // Import SQLite db module
// Removed setSessionContext import
//import { setSessionContext } from '../../lib/sessionUtils.js';
import zlib from 'zlib';

/**
 * ✅ Compress memory using zlib for efficient storage.
 * @param {string} memory - The memory data to compress.
 * @returns {Object} - Compressed memory, original length, and compression ratio.  Returns an error object if input is invalid.
 */
export function compressMemory(memory) {
    if (!memory || typeof memory !== 'string') {
        return { error: '❌ Invalid memory input. Must be a non-empty string.' };
    }

    const originalLength = memory.length;

    try {
        // 🗜️ Use zlib to compress memory efficiently
        const compressedBuffer = zlib.gzipSync(memory);
        const compressedMemory = compressedBuffer.toString('base64');
        const compressionRatio = ((1 - (compressedMemory.length / originalLength)) * 100).toFixed(2);

        console.log(`🗜️ Memory compressed by ${compressionRatio}%`);

        return {
            compressedMemory,
            originalLength,
            compressionRatio: `${compressionRatio}%`
        };

    } catch (error) {
        console.error(`❌ Compression failed: ${error.message}`);
        throw new Error('Failed to compress memory.');
    }
}

/**
 * ✅ Store compressed memory in the 'memories' table.
 * @param {object} req - The request object containing user and chatroom IDs.
 * @param {string} compressedMemory - The compressed memory data to store.
 */
export async function storeCompressedMemory(req, compressedMemory) {
    try {
        // 🔒 Validate input before proceeding
        const { userId, chatroomId } = req.session;
        if (!userId || !chatroomId || !compressedMemory) throw new Error("❌ Missing userId, chatroomId, or compressedMemory.");

        // 🔐 No need to set session context - handled by middleware
        // await setSessionContext(userId, chatroomId);
         // Use db.updateMemory (which handles insert and update)
        const result = await db.updateMemory(userId, chatroomId, compressedMemory);

        console.log(`✅ Compressed memory stored for user_id: ${userId}, chatroom_id: ${chatroomId}`);
        return result; // Return the result (usually true for success)

    } catch (error) {
        console.error('❌ Error in storeCompressedMemory:', error);
        throw error;
    }
}