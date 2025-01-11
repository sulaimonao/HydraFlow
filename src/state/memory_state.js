// src/state/memory_state.js
import supabase, { supabaseRequest } from '../../lib/supabaseClient.js';

let memory = "";

export async function appendMemory(newMemory) {
  memory += ` ${newMemory}`;
  try {
    await supabaseRequest(() => supabase.from('memory_state').update({ memory }).eq('id', 1));
  } catch (error) {
    console.error('Error appending memory:', error);
  }
  return memory;
}

export async function storeProjectData(userId, chatroomId, projectData) {
  try {
    await supabaseRequest(() => supabase.from('memory_state').insert([{ user_id: userId, chatroom_id: chatroomId, memory: projectData, updated_at: new Date().toISOString() }]));
  } catch (error) {
    console.error('Error storing project data:', error);
  }
}

export async function getMemory(userId, chatroomId) {
  try {
    const { data, error } = await supabaseRequest(() =>
      supabase
        .from('memory_state')
        .select('memory')
        .eq('user_id', userId)
        .eq('chatroom_id', chatroomId)
        .single()
    );

    if (error) {
      throw new Error(`Error fetching memory: ${error.message}`);
    }

    return data ? data.memory : "";
  } catch (error) {
    console.error('Error retrieving memory:', error);
    return "";
  }
}