// middleware/sessionContext.js
import { setSessionContext } from '../lib/sessionUtils.js';
import { v4 as uuidv4 } from 'uuid';
import { isValidUUID } from '../src/util/helpers.js';
import winston from 'winston';

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

    if (!isValidUUID(userId)) {
      userId = uuidv4();
      console.warn(`⚠️ Invalid userId. Generated new userId: ${userId}`);
    }
    if (!isValidUUID(chatroomId)) {
      chatroomId = uuidv4();
      console.warn(`⚠️ Invalid chatroomId. Generated new chatroomId: ${chatroomId}`);
    }

    console.log(`🔐 Using user_id: ${userId}, chatroom_id: ${chatroomId}`);

    try {
      await setSessionContext(userId, chatroomId);
    } catch (error) {
      logger.error('❌ Error setting session context:', error);
    }

    // Pass updated headers to next middleware
    req.headers['user_id'] = userId;
    req.headers['chatroom_id'] = chatroomId;

    // Set session values
    req.session.userId = userId;
    req.session.chatroomId = chatroomId;

    next();
  } catch (error) {
    logger.error('❌ Error in session context middleware:', error);
    res.status(500).json({ error: 'Failed to initialize session context.' });
  }
}
