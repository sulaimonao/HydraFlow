// middleware/authMiddleware.js
import { v4 as uuidv4 } from 'uuid';
import supabase, { setSessionContext, createSession } from '../lib/supabaseClient.js';

/**
 * Middleware to initialize or validate user and chatroom context.
 */
export const initializeUserContext = async (req, res, next) => {
  try {
    const sessionHeader = req.headers['x-hydra-session-id'];

    if (sessionHeader) {
      // ✅ Validate session format: "userId:chatroomId"
      const [userId, chatroomId] = sessionHeader.split(':');

      if (!userId || !chatroomId) {
        console.warn(`⚠️ Malformed session header: ${sessionHeader}`);
        return res.status(400).json({ error: 'Invalid session format.' });
      }

      // 🔍 Verify the session exists in Supabase
      const { data: sessionData, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('chatroom_id', chatroomId)
        .single();

      if (error || !sessionData) {
        console.warn(`⚠️ Session not found for user_id: ${userId}, chatroom_id: ${chatroomId}`);
        return res.status(400).json({ error: 'Session not found.' });
      }

      // ✅ Attach session to request
      req.session = { userId, chatroomId };
      console.log(`🔐 Valid session: user_id=${userId}, chatroom_id=${chatroomId}`);

    } else {
      // ❌ No session → Create a new one
      const userId = uuidv4();
      const chatroomId = uuidv4();

      // 🔐 Insert new session into Supabase
      await createSession(userId, chatroomId);

      req.session = { userId, chatroomId };

      // 📨 Set the session ID in the response header
      res.setHeader('X-Hydra-Session-ID', `${userId}:${chatroomId}`);
      console.log(`✅ New session created: user_id=${userId}, chatroom_id=${chatroomId}`);
    }

    // 🔒 Set Supabase session context
    await setSessionContext(req.session.userId, req.session.chatroomId);

    next();
  } catch (error) {
    console.error("❌ Error initializing user context:", error);
    res.status(500).json({ error: "Failed to initialize user context." });
  }
};
