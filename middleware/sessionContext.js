// middleware/sessionContext.js
import { setSessionContext } from '../lib/sessionUtils.js';
import { v4 as uuidv4 } from 'uuid';
import { isValidUUID } from '../src/util/helpers.js';
import winston from 'winston';
import { supabase } from '../lib/db.js';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

/**
 * Middleware to validate and set session context.
 */
export async function sessionContext(req, res, next) {
  console.log('🔍 Checking session context middleware execution...');
  try {
    // Ensure req.session is initialized
    if (!req.session) {
      req.session = {};
    }

    // Check for x-hydra-session-id header
    let sessionId = req.headers['x-hydra-session-id'];
    if (!sessionId) {
      return res.status(400).json({ error: 'x-hydra-session-id header is required.' });
    }

    let [userId, chatroomId] = sessionId.split(':');

    if (!isValidUUID(userId) || !isValidUUID(chatroomId)) {
      return res.status(400).json({ error: 'Invalid session ID format.' });
    }

    // Fetch session from the database
    const { data: sessionData, error: sessionError } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('chatroom_id', chatroomId)
      .single();

    if (sessionError || !sessionData) {
      return res.status(401).json({ error: 'Session not found or invalid.' });
    }

    console.log(`🔐 Using user_id: ${userId}, chatroom_id: ${chatroomId}`);

    try {
      await setSessionContext(userId, chatroomId);
    } catch (error) {
      logger.error('❌ Error setting session context:', error);
    }

    // Set session values
    req.session.userId = userId;
    req.session.chatroomId = chatroomId;

    next();
  } catch (error) {
    logger.error('❌ Error in session context middleware:', error);
    res.status(500).json({ error: 'Failed to initialize session context.' });
  }
}
