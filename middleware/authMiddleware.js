// middleware/authMiddleware.js

import { v4 as uuidv4, validate as validateUUID } from 'uuid';
import { setSessionContext } from '../lib/supabaseClient.js';

/**
 * Middleware to initialize or validate user and chatroom context.
 */
export const initializeUserContext = async (req, res, next) => {
  try {
    // 🔍 Validate existing or generate new userId
    let userId = req.session?.userId || req.userId;
    if (!validateUUID(userId)) {
      return res.status(400).json({ error: "Invalid user_id. Session not initialized properly." });
    }    

    // 🔍 Validate existing or generate new chatroomId
    let chatroomId = req.session?.chatroomId || req.chatroomId;
    if (!validateUUID(chatroomId)) {
      return res.status(400).json({ error: "Invalid chatroom_id. Session not initialized properly." });
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
