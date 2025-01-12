// middleware/authMiddleware.js

import supabase from '../lib/supabaseClient.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware to initialize user and chatroom context.
 * - Retrieves authenticated user_id using supabase.auth.getUser().
 * - Generates and attaches a chatroom_id if not already present.
 */
export const initializeUserContext = async (req, res, next) => {
  try {
    // Retrieve authenticated user from Supabase
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData) {
      console.error("Authentication error:", authError);
      return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    // Attach authenticated user_id to the request
    req.userId = authData.user.id;

    // Generate and attach chatroom_id if not already in session
    if (!req.session.chatroomId) {
      req.session.chatroomId = uuidv4();
    }
    req.chatroomId = req.session.chatroomId;

    next();
  } catch (error) {
    console.error("Error initializing user context:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};
