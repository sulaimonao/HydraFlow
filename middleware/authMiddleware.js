// middleware/authMiddleware.js

import { v4 as uuidv4 } from 'uuid';
import supabase, { setSessionContext } from '../lib/supabaseClient.js';

/**
 * Middleware to initialize or validate user and chatroom context.
 */
export const initializeUserContext = async (req, res, next) => {
  try {
    // 🔍 Check for existing session in header
    const existingSessionId = req.headers['x-hydra-session-id'];

    if (existingSessionId) {
      // 🔎 Validate existing session in Supabase
      const { data: sessionData, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('id', existingSessionId)
        .single();

      if (error || !sessionData) {
        console.warn(`⚠️ Invalid session ID: ${existingSessionId}`);
        return res.status(400).json({ error: 'Invalid session ID.' });
      }

      // ✅ Valid session, reuse IDs
      req.userId = sessionData.user_id;
      req.chatroomId = sessionData.chatroom_id;

      console.log(`🔐 Existing session used: user_id=${req.userId}, chatroom_id=${req.chatroomId}`);

    } else {
      // ❌ No session → Create a new one
      const userId = uuidv4();
      const chatroomId = uuidv4();

      // 🔐 Insert new session into Supabase
      const { error } = await supabase
        .from('user_sessions')
        .insert([{ id: uuidv4(), user_id: userId, chatroom_id: chatroomId }]);

      if (error) {
        console.error('❌ Failed to create user session:', error);
        return res.status(500).json({ error: 'Failed to initialize session.' });
      }

      req.userId = userId;
      req.chatroomId = chatroomId;

      // 📨 Return new session ID in the response header
      res.setHeader('X-Hydra-Session-ID', req.userId);

      console.log(`✅ New session initialized: user_id=${userId}, chatroom_id=${chatroomId}`);
    }

    // 🔒 Set Supabase session context for RLS
    await setSessionContext(req.userId, req.chatroomId);

    next();
  } catch (error) {
    console.error("❌ Error initializing user context:", error);
    res.status(500).json({ error: "Failed to initialize user context." });
  }
};
