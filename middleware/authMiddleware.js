// middleware/authMiddleware.js

import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware to initialize user and chatroom context.
 * - Generates and attaches a unique user_id if not already provided.
 * - Generates and attaches a chatroom_id for the session if missing.
 */
export const initializeUserContext = (req, res, next) => {
  try {
    // Check for existing user_id in request headers or body
    let userId = req.headers['x-user-id'] || req.body.user_id;

    // Generate user_id if not provided
    if (!userId) {
      userId = uuidv4();
    }

    // Attach user_id to request for downstream use
    req.userId = userId;

    // Check for an existing chatroom_id in session or headers
    let chatroomId = req.session?.chatroomId || req.headers['x-chatroom-id'];

    // Generate chatroom_id if missing
    if (!chatroomId) {
      chatroomId = uuidv4();
      req.session.chatroomId = chatroomId;
    }

    req.chatroomId = chatroomId;

    next();
  } catch (error) {
    console.error("Error initializing user context:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};
