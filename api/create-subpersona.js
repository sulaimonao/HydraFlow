// api/create-subpersona.js

import supabase, { supabaseRequest, setSessionContext } from '../lib/supabaseClient.js';
import { orchestrateContextWorkflow } from '../src/logic/workflow_manager.js';

const handleCreateSubpersona = async (req, res) => {
  try {
    const { name, capabilities, preferences, user_id, chatroom_id } = req.body;

    // ✅ Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Subpersona name is required.' });
    }

    // 🌐 Use workflow-generated IDs if not provided
    const workflowContext = await orchestrateContextWorkflow({});
    const persistentUserId = user_id || workflowContext.generatedIdentifiers.user_id;
    const persistentChatroomId = chatroom_id || workflowContext.generatedIdentifiers.chatroom_id;

    if (!persistentUserId || !persistentChatroomId) {
      return res.status(400).json({ error: 'Persistent user_id and chatroom_id are required.' });
    }

    // 🔒 Ensure session context is set for RLS
    await setSessionContext(persistentUserId, persistentChatroomId);

    // 📝 Insert new subpersona into the heads table
    const data = await supabaseRequest(
      supabase.from('heads').insert([
        {
          name,
          user_id: persistentUserId,
          chatroom_id: persistentChatroomId,
          capabilities,
          preferences,
          status: 'active',
          createdat: new Date().toISOString()
        }
      ]),
      persistentUserId,
      persistentChatroomId
    );

    res.status(200).json({ message: 'Subpersona created successfully.', data });

  } catch (error) {
    console.error("Error in create-subpersona:", error);
    res.status(500).json({ error: error.message });
  }
};

export default handleCreateSubpersona;
