// middleware/sessionInitializer.js
import { v4 as uuidv4, validate as validateUUID } from 'uuid';
import supabase from '../lib/supabaseClient.js';
import { setSessionContext } from '../lib/sessionUtils.js';

export async function initializeSession(req, res, next) {
  try {
    let sessionId = req.headers['x-hydra-session-id'];
    let userId, chatroomId;

    if (sessionId && sessionId.includes(':')) {
      // Existing session
      [userId, chatroomId] = sessionId.split(':');

      // Validate the IDs
      if (!validateUUID(userId) || !validateUUID(chatroomId)) {
        console.warn("⚠️ Invalid session ID format.");
        return res.status(400).json({ error: "Invalid session ID format." });
      }

      // Check if the session exists in the database
      const { data: sessionData, error: sessionError } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('chatroom_id', chatroomId)
        .single();

      if (sessionError || !sessionData) {
        console.warn("⚠️ Session not found or invalid.");
        return res.status(401).json({ error: "Session not found or invalid." });
      }

      req.session = { userId, chatroomId };
      console.log(`🔐 Session validated for user_id: ${userId}, chatroom_id: ${chatroomId}`);

    } else {
      // New session
      userId = uuidv4();
      chatroomId = uuidv4();
      sessionId = `${userId}:${chatroomId}`;

      // Create a new session in the database
      const { error: creationError } = await supabase
        .from('user_sessions')
        .insert([{ user_id: userId, chatroom_id: chatroomId }]);

      if (creationError) {
        console.error("❌ Error creating session:", creationError);
        return res.status(500).json({ error: "Failed to create session." });
      }

      req.session = { userId, chatroomId };
      res.setHeader('X-Hydra-Session-ID', sessionId);
      console.log(`✅ New session created: user_id=${userId}, chatroom_id=${chatroomId}`);
    }

    // Set Supabase context
    await setSessionContext(userId, chatroomId);

    next();
  } catch (error) {
    console.error("❌ Error initializing session:", error);
    res.status(500).json({ error: 'Failed to initialize session.' });
  }
}
