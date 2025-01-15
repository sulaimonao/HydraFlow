// src/state/memory_state.js
import supabase, { supabaseRequest, setSessionContext } from '../../lib/supabaseClient.js';
import { orchestrateContextWorkflow } from '../logic/workflow_manager.js';

let memory = "";

/**
 * Appends new memory and persists it in the database.
 */
export async function appendMemory(newMemory, query) {
  try {
    // Retrieve consistent user_id and chatroom_id from workflow manager
    const { generatedIdentifiers } = await orchestrateContextWorkflow({ query });
    const { user_id, chatroom_id } = generatedIdentifiers;

    // Set session context for Supabase RLS enforcement
    await setSessionContext(user_id, chatroom_id);

    // Append new memory
    memory += ` ${newMemory}`;

    // Update memory in the database
    await supabaseRequest(() =>
      supabase
        .from('memory_state')
        .update({ memory, updated_at: new Date().toISOString() })
        .eq('user_id', user_id)
        .eq('chatroom_id', chatroom_id)
    );

    return memory;
  } catch (error) {
    console.error('Error appending memory:', error);
    throw error;
  }
}

/**
 * Stores project data in the memory_state table.
 */
export async function storeProjectData(query, projectData) {
  try {
    // Retrieve consistent user_id and chatroom_id from workflow manager
    const { generatedIdentifiers } = await orchestrateContextWorkflow({ query });
    const { user_id, chatroom_id } = generatedIdentifiers;

    // Set session context for Supabase RLS enforcement
    await setSessionContext(user_id, chatroom_id);

    // Insert project data into memory_state
    await supabaseRequest(() =>
      supabase
        .from('memory_state')
        .insert([{
          user_id,
          chatroom_id,
          memory: projectData,
          updated_at: new Date().toISOString()
        }])
    );
  } catch (error) {
    console.error('Error storing project data:', error);
    throw error;
  }
}

/**
 * Retrieves memory for the user and chatroom.
 */
export async function getMemory(query) {
  try {
    // Retrieve consistent user_id and chatroom_id from workflow manager
    const { generatedIdentifiers } = await orchestrateContextWorkflow({ query });
    const { user_id, chatroom_id } = generatedIdentifiers;

    // Set session context for Supabase RLS enforcement
    await setSessionContext(user_id, chatroom_id);

    // Fetch memory from the database
    const { data, error } = await supabaseRequest(() =>
      supabase
        .from('memory_state')
        .select('memory')
        .eq('user_id', user_id)
        .eq('chatroom_id', chatroom_id)
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
