// api/create-subpersona.js

import supabase, { supabaseRequest, setSessionContext } from '../lib/supabaseClient.js';

const handleCreateSubpersona = async (req, res) => {
  try {
    const { name, capabilities, preferences, user_id, chatroom_id } = req.body;

    // ✅ Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Subpersona name is required.' });
    }
    if (!user_id || !chatroom_id) {
      return res.status(400).json({ error: 'user_id and chatroom_id are required.' });
    }

    // 🔒 Ensure session context is set for RLS
    await setSessionContext(user_id, chatroom_id);

    // 📝 Insert new subpersona into the heads table
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
      ]),
      user_id,
      chatroom_id
    );

    res.status(200).json({ message: 'Subpersona created successfully.', data });
  } catch (error) {
    console.error("Error in create-subpersona:", error);
    res.status(500).json({ error: error.message });
  }
};

export default handleCreateSubpersona;
