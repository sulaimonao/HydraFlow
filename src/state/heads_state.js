// src/state/heads_state.js
import supabase, { supabaseRequest } from '../../lib/supabaseClient.js';

export async function addHead(name, status) {
  try {
    const data = await supabaseRequest(
      supabase.from('heads').insert([{ name, status, createdAt: new Date().toISOString() }])
    );
    return data[0];
  } catch (error) {
    console.error('Error adding head:', error);
    throw error;
  }
}

export async function getHeads() {
  try {
    const data = await supabaseRequest(
      supabase.from('heads').select('*')
    );
    return data;
  } catch (error) {
    console.error('Error fetching heads:', error);
    throw error;
  }
}
