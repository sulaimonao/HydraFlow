// src/middleware/sessionInitializer.js

import { v4 as uuidv4, validate as validateUUID } from 'uuid';

/**
 * Middleware to initialize user and chatroom IDs if absent.
 * Ensures consistency and security for session tracking.
 */
export function initializeSession(req, res, next) {
  // Initialize session object if it doesn't exist
  if (!req.session) {
    req.session = {};
  }

  // === 🔍 Validate or Generate User ID ===
  let user_id = req.headers['x-user-id'] || req.body.user_id || req.session.user_id;
  if (!user_id || !validateUUID(user_id)) {
    user_id = uuidv4();
    console.log(`🆕 Generated new user_id: ${user_id}`);
  }
  req.session.user_id = user_id;
  req.userId = user_id;
  res.locals.user_id = user_id;  // ✅ Attach to response for middleware access

  // === 🔍 Validate or Generate Chatroom ID ===
  let chatroom_id = req.headers['x-chatroom-id'] || req.body.chatroom_id || req.session.chatroom_id;
  if (!chatroom_id || !validateUUID(chatroom_id)) {
    chatroom_id = uuidv4();
    console.log(`🆕 Generated new chatroom_id: ${chatroom_id}`);
  }
  req.session.chatroom_id = chatroom_id;
  req.chatroomId = chatroom_id;
  res.locals.chatroom_id = chatroom_id;  // ✅ Attach to response for middleware access

  next();
}

// === 📦 Middleware Integration ===
import express from 'express';
import existingMiddleware1 from './existingMiddleware1.js';
import existingMiddleware2 from './existingMiddleware2.js';

const app = express();

app.use(existingMiddleware1);
app.use(existingMiddleware2);
app.use(initializeSession);  // ✅ New session initializer middleware
