// src/state/memory_state.js
import supabase, { supabaseRequest } from '../../lib/supabaseClient';

let memory = "";

export async function appendMemory(newMemory) {
  memory += ` ${newMemory}`;
  await supabaseRequest(
    supabase.from('memory_state').update({ memory }).eq('id', 1)
  );
  return memory;
}
