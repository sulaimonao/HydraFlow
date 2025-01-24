// middleware/sessionContext.js
import { initializeSession } from '../middleware/sessionInitializer.js';
import { setSessionContext } from '../lib/sessionUtils.js';

/**
 * Middleware to validate and set session context.
 */
export async function sessionContext(req, res, next) {
  try {
    // Initialize session (if not already done)
    await initializeSession(req, res, () => {});

    // Safeguard in case req.session is undefined
    req.session = req.session || {};

    // Extract session data
    const { userId, chatroomId } = req.session;

    if (!userId || !chatroomId) {
      console.error(`❌ Missing session data. Path: ${req.path}, Method: ${req.method}`);
      return res.status(401).json({
        error: 'Unauthorized: Missing session data.',
        code: 'SESSION_DATA_MISSING',
      });
    }

    // Set Supabase session context
    await setSessionContext(userId, chatroomId);

    // Ensure req.locals is defined and set userId and chatroomId
    req.locals = req.locals || {};
    req.locals.userId = userId;
    req.locals.chatroomId = chatroomId;

    console.log(`🔐 Session context set: user_id=${userId}, chatroom_id=${chatroomId}`);
    next();
  } catch (error) {
    console.error(`❌ Error in sessionContext middleware. Path: ${req.path}, Method: ${req.method}`, error.message);
    res.status(500).json({
      error: 'Failed to set session context.',
      details: error.message,
      code: 'SESSION_CONTEXT_ERROR',
    });
  }
}
