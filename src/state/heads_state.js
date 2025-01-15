// src/state/heads_state.js
import supabase, { supabaseRequest, setSessionContext } from '../../lib/supabaseClient.js';
import { orchestrateContextWorkflow } from '../logic/workflow_manager.js';

/**
 * Adds a new head entry with persistent user and chatroom context.
 */
export async function addHead(name, status, query) {
  try {
    // Retrieve consistent user_id and chatroom_id from the workflow manager
    const { generatedIdentifiers } = await orchestrateContextWorkflow({ query });
    const { user_id, chatroom_id } = generatedIdentifiers;

    // Set session context for Supabase RLS enforcement
    await setSessionContext(user_id, chatroom_id);

    // Insert the new head with context identifiers
    const { data, error } = await supabaseRequest(() =>
      supabase.from('heads').insert([
        {
          name,
          status,
          user_id,
          chatroom_id,
          createdAt: new Date().toISOString()
        }
      ])
    );

    if (error) {
      throw new Error(`Error adding head: ${error.message}`);
    }

    return data[0];
  } catch (error) {
    console.error('Error adding head:', error);
    throw error;
  }
}

/**
 * Fetches all heads associated with the current user and chatroom.
 */
export async function getHeads(query) {
  try {
    // Retrieve consistent user_id and chatroom_id from the workflow manager
    const { generatedIdentifiers } = await orchestrateContextWorkflow({ query });
    const { user_id, chatroom_id } = generatedIdentifiers;

    // Set session context for Supabase RLS enforcement
    await setSessionContext(user_id, chatroom_id);

    // Fetch heads related to the user and chatroom
    const { data, error } = await supabaseRequest(() =>
      supabase
        .from('heads')
        .select('*')
        .eq('user_id', user_id)
        .eq('chatroom_id', chatroom_id)
    );

    if (error) {
      throw new Error(`Error fetching heads: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error fetching heads:', error);
    throw error;
  }
}
