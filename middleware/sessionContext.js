// middleware/sessionContext.js
import { setSessionContext } from '../lib/sessionUtils.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware to validate and set session context.
 */
export async function sessionContext(req, res, next) {
  console.log('🔍 Checking session context middleware execution...');
  try {
    // Check for x-hydra-session-id header or generate a new session ID
    let sessionId = req.headers['x-hydra-session-id'];
    if (!sessionId) {
      sessionId = `${uuidv4()}`;
      console.log(`🆕 Generated new session ID: ${sessionId}`);
      req.headers['x-hydra-session-id'] = sessionId;
    }

    // Generate default user_id and chatroom_id if not provided
    let userId = req.headers['user_id'] || `user-${uuidv4()}`;
    let chatroomId = req.headers['chatroom_id'] || `chatroom-${uuidv4()}`;

    console.log(`🔐 Using user_id: ${userId}, chatroom_id: ${chatroomId}`);

    // Set session context
    await setSessionContext(userId, chatroomId);

    // Pass updated headers to next middleware
    req.headers['user_id'] = userId;
    req.headers['chatroom_id'] = chatroomId;

    next();
  } catch (error) {
    console.error('❌ Error in session context middleware:', error);
    res.status(500).json({ error: 'Failed to initialize session context.' });
  }
}
