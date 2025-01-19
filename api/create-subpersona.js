// api/create-subpersona.js
import supabase, { setSessionContext } from '../lib/supabaseClient.js';
import { orchestrateContextWorkflow } from '../src/logic/workflow_manager.js';
import { insertHead } from '../lib/db.js';
import { sessionContext } from '../middleware/sessionContext.js';

const handleCreateSubpersona = async (req, res) => {
  sessionContext(req, res, async () => {
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

      const { userId, chatroomId } = req.locals;

      // 📝 Insert new subpersona into the heads table
      const head = await insertHead(userId, chatroomId, name, capabilities, preferences);

      // ✅ Success Response
      return res.status(200).json({
        success: true,
        message: 'Subpersona created successfully.',
        data: head,
        user_id: userId,
        chatroom_id: chatroomId
      });
    } catch (error) {
      console.error("❌ Error in create-subpersona:", error);
      res.status(500).json({
        success: false,
        error: 'Unexpected error occurred.',
        details: error.message
      });
    }
  });
};

export default handleCreateSubpersona;
