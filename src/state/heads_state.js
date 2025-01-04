//src/state/heads_state.js
import supabase, { supabaseRequest } from '../../lib/supabaseClient';

export async function addHead(name, status) {
  const data = await supabaseRequest(
    supabase.from('heads').insert([{ name, status, createdAt: new Date().toISOString() }])
  );
  return data[0];
}

export async function getHeads() {
  const data = await supabaseRequest(
    supabase.from('heads').select('*')
  );
  return data;
}
