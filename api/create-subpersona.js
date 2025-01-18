// api/create-subpersona.js
import supabase, { setSessionContext } from '../lib/supabaseClient.js';
import { orchestrateContextWorkflow } from '../src/logic/workflow_manager.js';
import { insertHead } from '../lib/db.js';

const handleCreateSubpersona = async (req, res) => {
  try {
    const { name, capabilities, preferences } = req.body;

    // ✅ Input Validation
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Valid subpersona name is required.' });
    }
    if (capabilities && typeof capabilities !== 'object') {
      return res.status(400).json({ error: 'Capabilities must be an object.' });
    }
    if (preferences && typeof preferences !== 'object') {
      return res.status(400).json({ error: 'Preferences must be an object.' });
    }

    // 🌐 Use workflow-generated IDs
    const workflowContext = await orchestrateContextWorkflow(req, {
      query: req.body.query || '',
      memory: req.body.memory || '',
      feedback: req.body.feedback || null,
      tokenCount: req.body.tokenCount || 0
    });
    const persistentUserId = workflowContext.generatedIdentifiers.user_id;
    const persistentChatroomId = workflowContext.generatedIdentifiers.chatroom_id;

    // 🔍 Validate persistent IDs
    if (!persistentUserId || !persistentChatroomId) {
      console.error("❌ Missing persistent user_id or chatroom_id.");
      return res.status(400).json({ error: 'Persistent user_id and chatroom_id are required.' });
    }

    // 🔒 Set session context for RLS enforcement
    await setSessionContext(persistentUserId, persistentChatroomId);

    // 📝 Insert new subpersona into the heads table
    const head = await insertHead(persistentUserId, persistentChatroomId, name, capabilities, preferences);

    // ✅ Success Response
    return res.status(200).json({
      success: true,
      message: 'Subpersona created successfully.',
      data: head,
      user_id: persistentUserId,
      chatroom_id: persistentChatroomId
    });
  } catch (error) {
    console.error("❌ Error in create-subpersona:", error);
    res.status(500).json({
      success: false,
      error: 'Unexpected error occurred.',
      details: error.message
    });
  }
};

export default handleCreateSubpersona;