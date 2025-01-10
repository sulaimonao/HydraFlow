// api/create-subpersona.js
import supabase, { supabaseRequest } from '../lib/supabaseClient.js';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  try {
    let { name, capabilities, preferences, user_id, chatroom_id } = req.body;

    // Generate default user_id and chatroom_id if missing
    try {
      user_id = user_id || uuidv4();
    } catch (error) {
      user_id = `user_${Date.now()}`;
    }

    try {
      chatroom_id = chatroom_id || uuidv4();
    } catch (error) {
      chatroom_id = `chat_${Date.now()}`;
    }

    if (!name) {
      return res.status(400).json({ error: 'Subpersona name is required.' });
    }

    // Check if user_id and chatroom_id exist in contexts table
    let { data: contextData, error: contextError } = await supabase
      .from('contexts')
      .select('id')
      .eq('user_id', user_id)
      .eq('chatroom_id', chatroom_id)
      .single();

    if (contextError || !contextData) {
      // Insert new context if it does not exist
      const { data: newContextData, error: newContextError } = await supabase
        .from('contexts')
        .insert([{ user_id, chatroom_id }])
        .single();

      if (newContextError) {
        return res.status(500).json({ error: 'Failed to create new context.' });
      }

      contextData = newContextData;
    }

    const subPersona = {
      name,
      capabilities,
      preferences,
      user_id,
      chatroom_id,
      createdAt: new Date().toISOString(),
    };

    const { data, error } = await supabaseRequest(() =>
      supabase.from('heads').insert([subPersona])
    );

    if (error) {
      throw new Error(`Error inserting head: ${error.message}`);
    }

    res.status(200).json({ message: 'Subpersona created successfully.', subPersona });
  } catch (error) {
    console.error("Error in create-subpersona:", error);
    res.status(500).json({ error: error.message });
  }
}