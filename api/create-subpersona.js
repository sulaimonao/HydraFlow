// api/create-subpersona.js
import supabase, { supabaseRequest } from '../lib/supabaseClient.js';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  try {
    let { name, capabilities, preferences, user_id, chatroom_id } = req.body;

    if (!name) {
      name = `Subpersona_${Date.now()}`;
    }

    // Ensure user_id and chatroom_id are provided
    if (!user_id || !chatroom_id) {
      return res.status(400).json({ error: "user_id and chatroom_id are required." });
    }

    // Check if context exists
    const { data: contextExists, error: contextError } = await supabase
      .from('contexts')
      .select('id')
      .eq('user_id', user_id)
      .eq('chatroom_id', chatroom_id)
      .single();

    if (contextError && contextError.code !== 'PGRST116') {
      throw new Error(`Error checking context: ${contextError.message}`);
    }

    // Create context if it doesn't exist
    if (!contextExists) {
      const { error: insertContextError } = await supabase
        .from('contexts')
        .insert([{ user_id, chatroom_id }]);

      if (insertContextError) {
        throw new Error(`Error creating context: ${insertContextError.message}`);
      }
    }

    // Proceed with inserting into heads
    const { data, error } = await supabaseRequest(() =>
      supabase.from('heads').insert([{ name, capabilities, preferences, user_id, chatroom_id }])
    );

    if (error) {
      throw new Error(`Error inserting head: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned from supabaseRequest');
    }

    // Include generated IDs in the response
    res.status(200).json({ ...data, user_id, chatroom_id });
  } catch (error) {
    console.error("Error in create-subpersona:", error);
    res.status(500).json({ error: error.message });
  }
}