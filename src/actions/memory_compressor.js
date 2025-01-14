// src/actions/memory_compressor.js
import supabase, { supabaseRequest, setSessionContext } from '../../lib/supabaseClient.js';

/**
 * ✅ Compress memory by reducing whitespace and redundant punctuation.
 * @param {string} memory - The memory data to compress.
 * @returns {Object} - Compressed memory, original length, and compression ratio.
 */
export function compressMemory(memory) {
  if (!memory || typeof memory !== 'string') {
    return { error: 'Invalid memory input. Must be a non-empty string.' };
  }

  const originalLength = memory.length;

  // 🔍 Compression logic: remove extra spaces and repeated punctuation
  const compressedMemory = memory.replace(/\s+/g, ' ').replace(/([.,!?])\1+/g, '$1');
  const compressionRatio = ((1 - (compressedMemory.length / originalLength)) * 100).toFixed(2);

  console.log(`🗜️ Memory compressed by ${compressionRatio}%`);

  return {
    compressedMemory,
    originalLength,
    compressionRatio: `${compressionRatio}%`
  };
}

/**
 * ✅ Store compressed memory in the 'memory_state' table with proper session context.
 * @param {string} userId - UUID of the user.
 * @param {string} chatroomId - UUID of the chatroom.
 * @param {string} compressedMemory - The compressed memory data to store.
 */
export async function storeCompressedMemory(userId, chatroomId, compressedMemory) {
  try {
    // 🔒 Validate context before proceeding
    if (!userId || !chatroomId) {
      throw new Error("Missing userId or chatroomId for storing compressed memory.");
    }

    // 🔐 Set Supabase session context to enforce RLS policies
    await setSessionContext(userId, chatroomId);

    // 📦 Insert the compressed memory into the database
    const { data, error } = await supabaseRequest(() =>
      supabase.from('memory_state').insert([{
        user_id: userId,
        chatroom_id: chatroomId,
        memory: compressedMemory,
        updated_at: new Date().toISOString()
      }])
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
