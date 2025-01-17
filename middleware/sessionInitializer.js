// src/middleware/sessionInitializer.js
import { v4 as uuidv4, validate as validateUUID } from 'uuid';

/**
 * Middleware to initialize user and chatroom IDs if absent.
 */
export function initializeSession(req, res, next) {
  if (!req.session) {
    req.session = {};
  }

  let userId = req.session.userId || req.userId;
  let chatroomId = req.session.chatroomId || req.chatroomId;

  if (!validateUUID(userId) || !validateUUID(chatroomId)) {
    userId = uuidv4();
    chatroomId = uuidv4();

    req.session.userId = userId;
    req.session.chatroomId = chatroomId;

    console.log(`🔄 New session generated: userId=${userId}, chatroomId=${chatroomId}`);
  }

  req.userId = userId;
  req.chatroomId = chatroomId;
  res.locals.chatroomId = chatroomId;

  next();
}
