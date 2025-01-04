// src/state/memory_state.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.DATABASE_URL;
const supabaseKey = process.env.KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

let memory = "";

export async function appendMemory(newMemory) {
  memory += ` ${newMemory}`;
  await supabase.from('memory_state').update({ memory }).eq('id', 1);
  return memory;
}
