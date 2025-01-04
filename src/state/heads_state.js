//src/state/heads_state.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.DATABASE_URL;
const supabaseKey = process.env.KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function addHead(name, status) {
  const { data, error } = await supabase.from('heads').insert([{ name, status, createdAt: new Date().toISOString() }]);
  if (error) throw new Error(`Error adding head: ${error.message}`);
  return data[0];
}

export async function getHeads() {
  const { data, error } = await supabase.from('heads').select('*');
  if (error) throw new Error(`Error fetching heads: ${error.message}`);
  return data;
}
