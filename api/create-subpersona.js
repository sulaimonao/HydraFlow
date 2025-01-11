// api/create-subpersona.js
import supabase, { supabaseRequest } from '../lib/supabaseClient.js';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';

const createSubpersona = async (req, res) => {
  try {
    const { name, capabilities, preferences, user_id, chatroom_id } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Subpersona name is required.' });
    }

    const generatedUserId = user_id || uuidv4();
    const generatedChatroomId = chatroom_id || uuidv4();

    // Check if user_id and chatroom_id exist
    let { data: contextData, error: contextError } = await supabase
      .from('contexts')
      .select('id')
      .eq('user_id', generatedUserId)
      .eq('chatroom_id', generatedChatroomId)
      .single();

    if (contextError || !contextData) {
      const { data: newContextData, error: newContextError } = await supabase
        .from('contexts')
        .insert([{ user_id: generatedUserId, chatroom_id: generatedChatroomId }])
        .single();

      if (newContextError) {
        return res.status(500).json({ error: 'Failed to create new context.' });
      }

      contextData = newContextData;
    }

    const subPersona = {
      name,
      capabilities: capabilities || {},
      preferences: preferences || {},
      user_id: generatedUserId,
      chatroom_id: generatedChatroomId,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    // Insert into 'heads' instead of 'subpersonas'
    const { data, error } = await supabaseRequest(() =>
      supabase.from('heads').insert([subPersona])
    );

    if (error) {
      throw new Error(`Error inserting subpersona into heads: ${error.message}`);
    }

    res.status(200).json({ message: 'Subpersona created successfully.', subPersona });
  } catch (error) {
    console.error("Error in create-subpersona:", error);
    res.status(500).json({ error: error.message });
  }
};

export default createSubpersona;
