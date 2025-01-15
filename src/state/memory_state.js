// src/state/memory_state.js
import supabase, { supabaseRequest, setSessionContext } from '../../lib/supabaseClient.js';
import { orchestrateContextWorkflow } from '../logic/workflow_manager.js';

let memory = "";

/**
 * ✅ Appends new memory and persists it in the database.
 * @param {string} newMemory - The memory content to append.
 * @param {Object} req - Request object for session tracking.
 * @param {string} query - The associated query.
 * @returns {string} - Updated memory.
 */
export async function appendMemory(newMemory, req, query) {
  try {
    // 🌐 Retrieve persistent IDs
    const { generatedIdentifiers } = await orchestrateContextWorkflow({ query, req });
    const { user_id, chatroom_id } = generatedIdentifiers;

    // 🔒 Set session context for RLS enforcement
    await setSessionContext(user_id, chatroom_id);

    // 📝 Append new memory
    memory += ` ${newMemory}`;

    // 📦 Use upsert for robust updating or inserting
    await supabaseRequest(() =>
      supabase
        .from('memory_state')
        .upsert([
          { user_id, chatroom_id, memory, updated_at: new Date().toISOString() }
        ], { onConflict: ['user_id', 'chatroom_id'] })
    );

    console.log(`✅ Memory updated for user_id: ${user_id}, chatroom_id: ${chatroom_id}`);
    return memory;
  } catch (error) {
    console.error('❌ Error appending memory:', error);
    throw error;
  }
}

/**
 * ✅ Stores project data in the memory_state table.
 * @param {Object} req - Request object for session tracking.
 * @param {string} query - Associated query.
 * @param {string} projectData - Project-specific memory data.
 */
export async function storeProjectData(req, query, projectData) {
  try {
    // 🌐 Retrieve persistent IDs
    const { generatedIdentifiers } = await orchestrateContextWorkflow({ query, req });
    const { user_id, chatroom_id } = generatedIdentifiers;

    // 🔒 Set session context for RLS enforcement
    await setSessionContext(user_id, chatroom_id);

    // 📦 Insert project data with upsert for flexibility
    await supabaseRequest(() =>
      supabase
        .from('memory_state')
        .upsert([
          { user_id, chatroom_id, memory: projectData, updated_at: new Date().toISOString() }
        ], { onConflict: ['user_id', 'chatroom_id'] })
    );

    console.log(`✅ Project data stored for user_id: ${user_id}, chatroom_id: ${chatroom_id}`);
  } catch (error) {
    console.error('❌ Error storing project data:', error);
    throw error;
  }
}

/**
 * ✅ Retrieves memory for the user and chatroom.
 * @param {Object} req - Request object for session tracking.
 * @param {string} query - Associated query.
 * @returns {string} - Retrieved memory or an empty string.
 */
export async function getMemory(req, query) {
  try {
    // 🌐 Retrieve persistent IDs
    const { generatedIdentifiers } = await orchestrateContextWorkflow({ query, req });
    const { user_id, chatroom_id } = generatedIdentifiers;

    // 🔒 Set session context for RLS enforcement
    await setSessionContext(user_id, chatroom_id);

    // 📦 Fetch memory from the database
    const { data, error } = await supabaseRequest(() =>
      supabase
        .from('memory_state')
        .select('memory')
        .eq('user_id', user_id)
        .eq('chatroom_id', chatroom_id)
        .single()
    );

    if (error) {
      throw new Error(`❌ Error fetching memory: ${error.message}`);
    }

    console.log(`📥 Retrieved memory for user_id: ${user_id}, chatroom_id: ${chatroom_id}`);
    return data ? data.memory : "";
  } catch (error) {
    console.error('❌ Error retrieving memory:', error);
    return "";
  }
}
