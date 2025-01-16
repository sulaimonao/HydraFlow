// api/create-subpersona.js
import supabase, { supabaseRequest, setSessionContext } from '../lib/supabaseClient.js';
import { orchestrateContextWorkflow } from '../src/logic/workflow_manager.js';

const handleCreateSubpersona = async (req, res) => {
  try {
    const { name, capabilities, preferences, user_id, chatroom_id } = req.body;

    // ✅ Validate required fields
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Valid subpersona name is required.' });
    }

    // 🌐 Use workflow-generated IDs if not provided
    const workflowContext = await orchestrateContextWorkflow(req, {
      query: req.body.query || '',
      memory: req.body.memory || '',
      feedback: req.body.feedback || null,
      tokenCount: req.body.tokenCount || 0,
    });

    const persistentUserId = user_id || workflowContext?.generatedIdentifiers?.user_id;
    const persistentChatroomId = chatroom_id || workflowContext?.generatedIdentifiers?.chatroom_id;

    // 🔍 Validate persistent IDs
    if (!persistentUserId || !persistentChatroomId) {
      console.error("❌ Missing persistent user_id or chatroom_id.");
      return res.status(400).json({ error: 'Persistent user_id and chatroom_id are required.' });
    }

    // 🔒 Ensure session context is set for RLS with error handling
    try {
      await setSessionContext(persistentUserId, persistentChatroomId);
    } catch (sessionError) {
      console.error("❌ Failed to set session context:", sessionError);
      return res.status(500).json({ error: 'Failed to initialize session context.' });
    }

    // 📝 Insert new subpersona into the heads table
    const { data, error } = await supabase
      .from('heads')
      .insert([
        {
          name,
          user_id: persistentUserId,
          chatroom_id: persistentChatroomId,
          capabilities: capabilities || null,
          preferences: preferences || null,
          status: 'active',
          createdat: new Date().toISOString(),
        }
      ])
      .select();

    // ❗ Handle insertion errors
    if (error) {
      console.error('❌ Error inserting subpersona:', error);
      return res.status(500).json({ error: 'Failed to create subpersona. Please try again.' });
    }

    // ✅ Success Response
    return res.status(200).json({
      message: 'Subpersona created successfully.', 
      data: data[0],
      user_id: persistentUserId, 
      chatroom_id: persistentChatroomId 
    });

  } catch (error) {
    console.error("❌ Error in create-subpersona:", error);
    res.status(500).json({ error: 'Unexpected error occurred.', details: error.message });
  }
};

export default handleCreateSubpersona;
