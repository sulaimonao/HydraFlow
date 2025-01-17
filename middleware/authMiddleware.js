// middleware/authMiddleware.js

import { v4 as uuidv4, validate as validateUUID } from 'uuid';
import { setSessionContext, supabase } from '../lib/supabaseClient.js';

/**
 * Middleware to initialize or validate user and chatroom context.
 */
export const initializeUserContext = async (req, res, next) => {
  try {
    // 🔍 Check for an existing session ID from a custom header or cookie
    const existingSessionId = req.headers['x-hydra-session-id'];

    if (existingSessionId) {
      // 🔍 Validate the session ID with Supabase
      const { data: sessionData, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('id', existingSessionId)
        .single();

      if (error) {
        console.error("❌ Error fetching session data:", error);
        return res.status(500).json({ error: "Failed to validate session." });
      }

      if (!sessionData) {
        return res.status(400).json({ error: "Invalid session ID." });
      }

      // ✅ Attach existing session IDs to request
      req.userId = sessionData.user_id;
      req.chatroomId = sessionData.chatroom_id;
      req.session.userId = sessionData.user_id;
      req.session.chatroomId = sessionData.chatroom_id;

      console.log(`🔐 Existing session used: user_id=${req.userId}, chatroom_id=${req.chatroomId}`);
    } else {
      // 🚀 Generate new session if no session ID is provided
      const userId = uuidv4();
      const chatroomId = uuidv4();

      req.session.userId = userId;
      req.session.chatroomId = chatroomId;
      req.userId = userId;
      req.chatroomId = chatroomId;

      // 📦 Insert new session into user_sessions table
      const { error: insertError } = await supabase
        .from('user_sessions')
        .insert([{ id: uuidv4(), user_id: userId, chatroom_id: chatroomId }]);

      if (insertError) {
        console.error("❌ Error creating new session:", insertError);
        return res.status(500).json({ error: "Failed to create a new session." });
      }

      // 📬 Send the session ID back to the client
      res.setHeader('X-Hydra-Session-ID', req.session.userId);
      console.log(`✅ New session initialized: user_id=${userId}, chatroom_id=${chatroomId}`);
    }

    // 🔐 Set Supabase session context for RLS policies
    await setSessionContext(req.userId, req.chatroomId);
    next();
  } catch (error) {
    console.error("❌ Error initializing user context:", error);
    res.status(500).json({ error: "Failed to initialize user context." });
  }
};
