// middleware/authMiddleware.js
import { v4 as uuidv4 } from 'uuid';
import supabase, { setSessionContext } from '../lib/supabaseClient.js';

/**
 * Middleware to initialize or validate user and chatroom context.
 */
export const initializeUserContext = async (req, res, next) => {
  try {
    const existingSessionId = req.headers['x-hydra-session-id'];

    if (existingSessionId) {
      const { data: sessionData, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('id', existingSessionId)
        .single();

      if (error || !sessionData) {
        console.warn(`⚠️ Invalid session ID: ${existingSessionId}`);
        return res.status(400).json({ error: 'Invalid session ID.' });
      }

      req.session = {
        userId: sessionData.user_id,
        chatroomId: sessionData.chatroom_id
      };

      console.log(`🔐 Existing session: user_id=${req.session.userId}, chatroom_id=${req.session.chatroomId}`);

    } else {
      const userId = uuidv4();
      const chatroomId = uuidv4();

      const { error } = await supabase
        .from('user_sessions')
        .insert([{ id: uuidv4(), user_id: userId, chatroom_id: chatroomId }])
        .select();

      if (error) {
        console.error('❌ Failed to create user session:', error);
        return res.status(500).json({ error: 'Failed to initialize session.' });
      }

      req.session = {
        userId,
        chatroomId
      };

      res.setHeader('X-Hydra-Session-ID', `${userId}:${chatroomId}`);
      console.log(`✅ New session initialized: user_id=${userId}, chatroom_id=${chatroomId}`);
    }

    await setSessionContext(req.session.userId, req.session.chatroomId);
    next();
  } catch (error) {
    console.error("❌ Error initializing user context:", error);
    res.status(500).json({ error: "Failed to initialize user context." });
  }
};
