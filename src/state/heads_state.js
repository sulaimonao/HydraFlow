// src/state/heads_state.js
import { supabase, supabaseRequest } from '../lib/db.js';
import { setSessionContext } from '../../lib/sessionUtils.js';
import { orchestrateContextWorkflow } from '../logic/workflow_manager.js';

/**
 * ✅ Adds a new head entry with proper session context.
 * @param {string} name - Name of the head/subpersona.
 * @param {string} status - Status of the head (active/inactive).
 * @param {Object} req - Request object for session tracking.
 * @param {string} query - Associated query for workflow tracking.
 * @returns {Object} - The newly created head data.
 */
export async function addHead(name, status, req, query) {
  try {
    const user_id = req.session.userId;
    const chatroom_id = req.session.chatroomId;

    // 🔒 Set session context for RLS enforcement
    await setSessionContext(user_id, chatroom_id);

    // 📝 Insert new head into the 'heads' table
    const { data, error } = await supabaseRequest(() =>
      supabase.from('heads').insert([
        {
          name,
          status,
          user_id,
          chatroom_id,
          created_at: new Date().toISOString()
        }
      ])
    );

    if (error) {
      throw new Error(`❌ Error adding head: ${error.message}`);
    }

    console.log(`✅ New head '${name}' added for user_id: ${user_id}, chatroom_id: ${chatroom_id}`);
    return data[0];
  } catch (error) {
    console.error('❌ Error adding head:', error.message);
    throw new Error('Failed to add head.');
  }
}

/**
 * ✅ Fetches all heads for the current user and chatroom.
 * @param {Object} req - Request object for session tracking.
 * @param {string} query - Query for workflow tracking.
 * @returns {Array} - List of heads.
 */
export async function getHeads(req, query) {
  try {
    const user_id = req.session.userId;
    const chatroom_id = req.session.chatroomId;

    // 🔒 Set session context for RLS enforcement
    await setSessionContext(user_id, chatroom_id);

    // 📦 Fetch heads related to the session
    const { data, error } = await supabaseRequest(() =>
      supabase
        .from('heads')
        .select('*')
        .eq('user_id', user_id)
        .eq('chatroom_id', chatroom_id)
    );

    if (error) {
      throw new Error(`❌ Error fetching heads: ${error.message}`);
    }

    console.log(`📂 Retrieved ${data.length} heads for user_id: ${user_id}, chatroom_id: ${chatroom_id}`);
    return data;
  } catch (error) {
    console.error('❌ Error fetching heads:', error.message);
    throw new Error('Failed to retrieve heads.');
  }
}
