// middleware/authMiddleware.js

import { v4 as uuidv4, validate as validateUUID } from 'uuid';
import { setSessionContext } from '../lib/supabaseClient.js';

/**
 * Middleware to initialize or validate user and chatroom context.
 */
export const initializeUserContext = async (req, res, next) => {
  try {
    // 🔍 Validate existing or generate new userId
    let userId = req.headers['x-user-id'] || req.body.user_id || req.session?.userId;
    if (!validateUUID(userId)) {
      userId = uuidv4();
      console.warn("⚠️ Invalid or missing user_id. Generated a new one:", userId);
    }

    // 🔍 Validate existing or generate new chatroomId
    let chatroomId = req.headers['x-chatroom-id'] || req.body.chatroom_id || req.session?.chatroomId;
    if (!validateUUID(chatroomId)) {
      chatroomId = uuidv4();
      console.warn("⚠️ Invalid or missing chatroom_id. Generated a new one:", chatroomId);
    }

    // 📝 Persist IDs in session
    req.session.userId = userId;
    req.session.chatroomId = chatroomId;

    // 🔐 Set Supabase session context for RLS policies
    await setSessionContext(userId, chatroomId);

    // 🏷️ Attach IDs to request object for downstream use
    req.userId = userId;
    req.chatroomId = chatroomId;

    console.log(`🔐 Session initialized: user_id=${userId}, chatroom_id=${chatroomId}`);

    next();
  } catch (error) {
    console.error("❌ Error initializing user context:", error);
    res.status(500).json({ error: "Failed to initialize user context." });
  }
};
