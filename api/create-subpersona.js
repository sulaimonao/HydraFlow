// api/create-subpersona.js
import supabase from '../../lib/supabaseClient';

export default async function handler(req, res) {
  try {
    const { name, capabilities, preferences, user_id, chatroom_id } = req.body;

    // Input validation
    if (!name || !user_id || !chatroom_id) {
      return res.status(400).json({ error: 'Name, user_id, and chatroom_id are required.' });
    }

    const { data, error } = await supabase
      .from('heads')
      .insert([{ name, capabilities, preferences, user_id, chatroom_id }])
      .select();

    if (error) {
      throw new Error(`Error creating sub-persona: ${error.message}`);
    }

    res.status(200).json({
      message: 'Sub-persona created successfully.',
      subPersona: data[0],
    });
  } catch (error) {
    console.error('Error in create-subpersona:', error);
    res.status(500).json({ error: 'Failed to create sub-persona. Please try again.' });
  }
}
