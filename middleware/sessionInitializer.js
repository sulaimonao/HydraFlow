// src/middleware/sessionInitializer.js

import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware to initialize user and chatroom IDs if absent.
 */
export function initializeSession(req, res, next) {
  if (!req.session) {
    req.session = {};
  }

  if (!req.session.user_id) {
    req.session.user_id = uuidv4();
  }

  if (!req.session.chatroom_id) {
    req.session.chatroom_id = uuidv4();
  }

  next();
}

// Integration with existing middleware
import express from 'express';
import existingMiddleware1 from './existingMiddleware1.js';
import existingMiddleware2 from './existingMiddleware2.js';

const app = express();

app.use(existingMiddleware1);
app.use(existingMiddleware2);
app.use(initializeSession);  // New session initializer middleware
