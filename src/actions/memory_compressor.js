// src/actions/memory_compressor.js
import { supabase, supabaseRequest } from '../../lib/db.js';
import { setSessionContext } from '../../lib/sessionUtils.js';
import zlib from 'zlib'; 

/**
 * ✅ Compress memory using zlib for efficient storage.
 * @param {string} memory - The memory data to compress.
 * @returns {Object} - Compressed memory, original length, and compression ratio.
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
 * ✅ Store compressed memory in the 'memories' table with proper session context.
 * @param {Request} req - The request object containing user and chatroom IDs.
 * @param {string} compressedMemory - The compressed memory data to store.
 */
export async function storeCompressedMemory(req, compressedMemory) {
  try {
    // 🔒 Validate input before proceeding
    const { userId, chatroomId } = req.session;
    if (!userId || !chatroomId || !compressedMemory) throw new Error("❌ Missing userId, chatroomId, or compressedMemory.");

    // 🔐 Set Supabase session context to enforce RLS policies
    await setSessionContext(userId, chatroomId);

    // 📦 Insert or update the compressed memory in the 'memories' table
    const { data, error } = await supabaseRequest(() =>
      supabase.from('memories').upsert(
        [{
          user_id: userId,
          chatroom_id: chatroomId,
          memory: compressedMemory,
          updated_at: new Date().toISOString()
        }],
        { onConflict: ['user_id', 'chatroom_id'] }  // ✅ Avoid duplicate entries
      )
    );

    if (error) {
      console.error(`❌ Failed to store compressed memory: ${error.message}`);
      throw new Error(`Error inserting compressed memory: ${error.message}`);
    }

    console.log(`✅ Compressed memory stored for user_id: ${userId}, chatroom_id: ${chatroomId}`);
    return data[0];

  } catch (error) {
    console.error('❌ Error in storeCompressedMemory:', error);
    throw error;
  }
}
