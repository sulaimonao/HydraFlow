// src/util/logger.js

/**
 * Generates a timestamp for log entries.
 * @returns {string} - Current ISO timestamp.
 */
function timestamp() {
  return new Date().toISOString();
}

/**
 * Formats context data for logs.
 * @param {string} user_id - User ID.
 * @param {string} chatroom_id - Chatroom ID.
 * @returns {string} - Formatted context string.
 */
function formatContext(user_id, chatroom_id) {
  return user_id && chatroom_id
    ? ` | user_id: ${user_id} | chatroom_id: ${chatroom_id}`
    : '';
}

/**
 * Logs informational messages.
 * @param {string} message - The log message.
 * @param {string} [user_id] - Optional user ID.
 * @param {string} [chatroom_id] - Optional chatroom ID.
 */
export function logInfo(message, user_id = null, chatroom_id = null) {
  console.log(`[INFO] ${timestamp()}: ${message}${formatContext(user_id, chatroom_id)}`);
}

/**
 * Logs error messages.
 * @param {string} message - The error message.
 * @param {string} [user_id] - Optional user ID.
 * @param {string} [chatroom_id] - Optional chatroom ID.
 */
export function logError(message, user_id = null, chatroom_id = null) {
  console.error(`[ERROR] ${timestamp()}: ${message}${formatContext(user_id, chatroom_id)}`);
}

/**
 * Logs debug messages only in development mode.
 * @param {string} message - The debug message.
 * @param {string} [user_id] - Optional user ID.
 * @param {string} [chatroom_id] - Optional chatroom ID.
 */
export function logDebug(message, user_id = null, chatroom_id = null) {
  if (process.env.NODE_ENV === 'development') {
    console.debug(`[DEBUG] ${timestamp()}: ${message}${formatContext(user_id, chatroom_id)}`);
  }
}
