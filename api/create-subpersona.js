// api/create-subpersona.js
import supabase, { supabaseRequest } from '../lib/supabaseClient.js';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  try {
    let { name, capabilities, preferences, user_id, chatroom_id } = req.body;

    if (!name) {
      name = `Subpersona_${Date.now()}`;
    }
    if (!user_id) {
      user_id = uuidv4();
      console.warn(`Missing user_id; generated: ${user_id}`);
    }
    if (!chatroom_id) {
      chatroom_id = uuidv4();
      console.warn(`Missing chatroom_id; generated: ${chatroom_id}`);
    }

    // Wrapped in a function to avoid TypeError
    const data = await supabaseRequest(() =>
      supabase.from('heads').insert([{ name, capabilities, preferences, user_id, chatroom_id }])
    );

    res.status(200).json({
      message: 'Sub-persona created successfully.',
      subPersona: data[0],
      user_id, 
      chatroom_id,
    });
  } catch (error) {
    console.error('Error in create-subpersona:', error);
    res.status(500).json({ error: 'Failed to create sub-persona.' });
  }
}