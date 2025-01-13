// api/create-subpersona.js

import supabase, { supabaseRequest } from '../lib/supabaseClient.js';

const handleCreateSubpersona = async (req, res) => {
  try {
    const { name, capabilities, preferences } = req.body;
    const user_id = req.userId;
    const chatroom_id = req.chatroomId;

    if (!name) {
      return res.status(400).json({ error: 'Subpersona name is required.' });
    }

    const data = await supabaseRequest(
      supabase.from('heads').insert([
        {
          name,
          user_id,
          chatroom_id,
          capabilities,
          preferences,
          status: 'active',
          createdat: new Date().toISOString()
        }
      ])
    );

    res.status(200).json({ message: 'Subpersona created successfully.', data });
  } catch (error) {
    console.error("Error in create-subpersona:", error);
    res.status(500).json({ error: error.message });
  }
};

export default handleCreateSubpersona;
