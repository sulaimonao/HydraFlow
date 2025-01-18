// src/middleware/sessionInitializer.js
import { v4 as uuidv4, validate as validateUUID } from 'uuid';
import supabase, { setSessionContext, createSession } from '../lib/supabaseClient.js';

/**
 * Middleware to initialize or restore user and chatroom session.
 */
export async function initializeSession(req, res, next) {
  try {
    if (!req.session) {
      req.session = {};
    }

    let userId = req.session.userId || req.userId;
    let chatroomId = req.session.chatroomId || req.chatroomId;

    // 🔍 Check if valid session IDs exist
    if (validateUUID(userId) && validateUUID(chatroomId)) {
      // 🔎 Validate session in Supabase
      const { data: sessionData, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('chatroom_id', chatroomId)
        .single();

      if (error || !sessionData) {
        console.warn(`⚠️ No active session found for user_id=${userId}, chatroom_id=${chatroomId}`);
        userId = uuidv4();
        chatroomId = uuidv4();

        // 📝 Insert new session in Supabase
        await createSession(userId, chatroomId);
        console.log(`✅ New session created in Supabase: user_id=${userId}, chatroom_id=${chatroomId}`);
      } else {
        console.log(`🔐 Restored session: user_id=${userId}, chatroom_id=${chatroomId}`);
      }
    } else {
      // 🆕 Generate new session if invalid
      userId = uuidv4();
      chatroomId = uuidv4();

      await createSession(userId, chatroomId);
      console.log(`✅ New session initialized: user_id=${userId}, chatroom_id=${chatroomId}`);
    }

    // 🔒 Set Supabase session context for RLS
    await setSessionContext(userId, chatroomId);

    req.session.userId = userId;
    req.session.chatroomId = chatroomId;
    req.userId = userId;
    req.chatroomId = chatroomId;
    res.locals.chatroomId = chatroomId;

    next();
  } catch (error) {
    console.error("❌ Error initializing session:", error);
    res.status(500).json({ error: "Failed to initialize session." });
  }
}
