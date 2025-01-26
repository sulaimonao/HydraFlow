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
      sessionId = `${uuidv4()}:${uuidv4()}`;
      req.headers['x-hydra-session-id'] = sessionId;
    }
    const [userId, chatroomId] = sessionId.split(':');
    
    // Safeguard in case req.session is undefined
    req.session = req.session || {};
    req.session.userId = userId;
    req.session.chatroomId = chatroomId;

    // Set Supabase session context
    await setSessionContext(userId, chatroomId);

    // Log the session initialization
    console.log(`✅ Session initialized. userId: ${userId}, chatroomId: ${chatroomId}`);

    next();
  } catch (error) {
    console.error(`❌ Session Error: ${error.message}`);
    res.status(500).json({
      error: 'Failed to set session context.',
    });
  }
}
