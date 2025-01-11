// src/actions/memory_compressor.js

import supabase, { supabaseRequest } from '../../lib/supabaseClient.js';

export function compressMemory(memory) {
  if (!memory || typeof memory !== 'string') {
    return { error: 'Invalid memory input.' };
  }

  const originalLength = memory.length;
  // Enhanced compression: remove redundant punctuation and extra spaces
  const compressedMemory = memory.replace(/\s+/g, ' ').replace(/([.,!?])\1+/g, '$1');
  const compressionRatio = ((1 - (compressedMemory.length / originalLength)) * 100).toFixed(2);

  return {
    compressedMemory,
    originalLength,
    compressionRatio: `${compressionRatio}%`
  };
}

export async function storeCompressedMemory(userId, chatroomId, compressedMemory) {
  try {
    await supabaseRequest(
      supabase.from('memory_state').insert([{ user_id: userId, chatroom_id: chatroomId, memory: compressedMemory, updated_at: new Date().toISOString() }])
    );
  } catch (error) {
    console.error('Error storing compressed memory:', error);
  }
}
