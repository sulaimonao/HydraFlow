// src/util/logger.js

import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

export default logger;

/**
 * Generates a timestamp for log entries.
 * @returns {string} - Current ISO timestamp.
 */
function timestamp() {
  return new Date().toISOString();
}

/**
 * Formats context data for logs.
 * @param {object} req - The request object.
 * @returns {string} - Formatted context string.
 */
function formatContext(req) {
  return req.session && req.session.userId && req.session.chatroomId
    ? ` | user_id: ${req.session.userId} | chatroom_id: ${req.session.chatroomId}`
    : '';
}

/**
 * Logs informational messages.
 * @param {string} message - The log message.
 * @param {object} req - The request object.  Contains session data.
 */
export function logInfo(message, req) {
  console.log(`[INFO] ${timestamp()}: ${message}${formatContext(req)}`);
}

/**
 * Logs error messages.
 * @param {string} message - The error message.
 * @param {string} [user_id] - Optional user ID.
 * @param {string} [chatroom_id] - Optional chatroom ID.
 */
export function logError(message, user_id = null, chatroom_id = null) {
  console.error(`[ERROR] ${timestamp()}: ${message}${formatContext({ session: { userId: user_id, chatroomId: chatroom_id } })}`);
}

/**
 * Logs debug messages only in development mode.
 * @param {string} message - The debug message.
 * @param {object} req - The request object. Contains session data.
 */
export function logDebug(message, req) {
  if (process.env.NODE_ENV === 'development') {
    console.debug(`[DEBUG] ${timestamp()}: ${message}${formatContext(req)}`);
  }
}

