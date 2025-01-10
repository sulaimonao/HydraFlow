// src/state/memory_state.js
import supabase, { supabaseRequest } from '../../lib/supabaseClient';

let memory = "";

export async function appendMemory(newMemory) {
  memory += ` ${newMemory}`;
  try {
    await supabaseRequest(
      supabase.from('memory_state').update({ memory }).eq('id', 1)
    );
  } catch (error) {
    console.error('Error appending memory:', error);
  }
  return memory;
}

export async function storeProjectData(userId, chatroomId, projectData) {
  try {
    await supabaseRequest(
      supabase.from('memory_state').insert([{ user_id: userId, chatroom_id: chatroomId, memory: projectData, updated_at: new Date().toISOString() }])
    );
  } catch (error) {
    console.error('Error storing project data:', error);
  }
}
